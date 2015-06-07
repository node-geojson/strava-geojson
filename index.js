var got = require('got'),
    xtend = require('xtend'),
    geojsonStream = require('geojson-stream'),
    filter = require('through2-filter').obj,
    through2 = require('through2').obj,
    Readable = require('stream').Readable,
    util = require('util');

var defaults = {
    headers: {
        Authorization: 'Bearer ' + process.env.STRAVA_TOKEN
    },
    json: true
};

util.inherits(Source, Readable);

function Source(opt) {
    Readable.call(this, opt);
    this.page = 1;
    this.inflight = false;
}

Source.prototype._read = function() {
    if (this.isPaused()) return;
    this.pause();
    var page = this.page;
    got('https://www.strava.com/api/v3/athlete/activities', xtend(defaults, {
        query: { per_page: 100, page: page }
    }), function(err, res) {
        this.page++;
        if (err) this.emit('error', err);
        console.error('got page of %s items', res.length);
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

(new Source({ objectMode: true }))
    .pipe(through2(function(chunk, enc, callback) {
        console.error('pushing %s runs into stream', chunk.length);
        chunk.forEach(function(c) {
            this.push(c.id);
        }.bind(this));
        callback();
    }))
    .pipe(through2(function(chunk, enc, callback) {
        console.error('loading run %s', chunk);
        got('https://www.strava.com/api/v3/activities/' + chunk + '/streams/latlng', defaults, callback);
    }))
    .pipe(filter(function(chunk) { return Array.isArray(chunk); }))
    .pipe(through2(function(chunk, enc, callback) {
        var converted = convert(chunk);
        callback(null, converted);
    }))
    .pipe(geojsonStream.stringify())
    .pipe(process.stdout);
