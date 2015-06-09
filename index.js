var xhr = require('httpify'),
    qs = require('querystring'),
    geojsonStream = require('geojson-stream'),
    filter = require('through2-filter').obj,
    through2 = require('through2').obj,
    Readable = require('stream').Readable,
    util = require('util');

var ACTIVITIES_URL = 'https://www.strava.com/api/v3/athlete/activities';

function Source(opt) {
    opt.objectMode = true;
    Readable.call(this, opt);
    this.page = 1;
    this.STRAVA_TOKEN = opt.STRAVA_TOKEN;
    this.inflight = false;
}

util.inherits(Source, Readable);

Source.prototype._read = function() {
    if (this.isPaused()) return;
    this.pause();
    var page = this.page;
    xhr({
        url: ACTIVITIES_URL + '?' + qs.stringify({ per_page: 100, page: page }),
        headers: { Authorization: 'Bearer ' + this.STRAVA_TOKEN },
        type: 'json'
    }, function(err, res) {
        this.page++;
        if (err) this.emit('error', err);
        this.emit('debug', 'xhr page of ' + res.body.length + ' items');
        this.resume();
        if (res.body.length) this.push(res.body);
        if (res.body.length < 100) {
            this.push(null);
            this.emit('end');
        }
    }.bind(this));
};

function convert(stream) {
    if (!stream || !stream.filter) return;
    return stream.filter(function(e) {
        return e.type === 'latlng';
    }).map(function(e) {
        return {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: e.data.map(function(coord) {
                    return coord.slice().reverse();
                })
            }
        };
    })[0];
}

function loadRuns(STRAVA_TOKEN) {
    return (new Source({ STRAVA_TOKEN: STRAVA_TOKEN }))
        .pipe(through2(function(chunk, enc, callback) {
            this.emit('debug', 'pushing ' + chunk.length + ' runs into stream');
            chunk.forEach(function(c) {
                this.push(c.id);
            }.bind(this));
            callback();
        }))
        .pipe(through2(function(chunk, enc, callback) {
            xhr({
                url: 'https://www.strava.com/api/v3/activities/' + chunk + '/streams/latlng',
                type: 'json',
                headers: { Authorization: 'Bearer ' + STRAVA_TOKEN }
            }, function(err, res) {
                if (err) console.error(err);
                // purposely avoid throwing on errors
                callback(null, res.body);
            });
        }))
        .pipe(filter(Array.isArray))
        .pipe(through2(function(chunk, enc, callback) {
            var converted = convert(chunk);
            callback(null, converted);
        }))
        .pipe(geojsonStream.stringify());
}

module.exports = loadRuns;
