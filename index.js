var jsonp = require('jsonp'),
    qs = require('querystring'),
    geojsonStream = require('geojson-stream'),
    filter = require('through2-filter').obj,
    through2 = require('through2').obj,
    Readable = require('readable-stream'),
    util = require('util');

var ACTIVITIES_URL = 'https://www.strava.com/api/v3/athlete/activities';

util.inherits(Source, Readable);

function Source(opt) {
    opt.objectMode = true;
    Readable.call(this, opt);
    this.page = 1;
    this.STRAVA_TOKEN = opt.STRAVA_TOKEN;
}

Source.prototype._read = function() {
    this.pause();
    var page = this.page;
    jsonp(ACTIVITIES_URL + '?' +
        qs.stringify({
            per_page: 100,
            access_token: this.STRAVA_TOKEN,
            page: page
        }), { timeout: 5000 }, function(err, res) {
        this.page++;
        if (err) this.emit('error', err);
        this.emit('debug', 'xhr page of ' + res.length + ' items');
        this.resume();
        if (res.length) this.push(res);
        if (res.length < 100) {
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
           jsonp('https://www.strava.com/api/v3/activities/' + chunk + '/streams/latlng?' +
           qs.stringify({
               access_token: STRAVA_TOKEN
           }), { timeout: 5000 }, function(err, res) {
               console.log(err, res);
               if (err) console.error(err);
               // purposely avoid throwing on errors
               callback(null, res);
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
