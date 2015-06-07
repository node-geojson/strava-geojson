var got = require('got'),
    xtend = require('xtend'),
    geojsonStream = require('geojson-stream'),
    through2 = require('through2'),
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
    if (this.inflight) return;
    this.inflight = true;
    var page = this.page;
    got('https://www.strava.com/api/v3/athlete/activities', xtend(defaults, {
        query: { per_page: 100, page: page }
    }), function(err, res) {
        this.page++;
        this.inflight = false;
        if (err) this.emit('error', err);
        res.forEach(function(r) {
            this.push(String(r.id));
        }.bind(this));
        if (res.length < 100) {
            this.emit('end');
        }
    }.bind(this));
};

function convert(stream) {
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

(new Source())
    .pipe(through2.obj(function(chunk, enc, callback) {
        got('https://www.strava.com/api/v3/activities/' + chunk + '/streams/latlng', defaults, callback);
    }))
    .pipe(through2.obj(function(chunk, enc, callback) {
        callback(null, convert(chunk));
    }))
    .pipe(geojsonStream.stringify())
    .pipe(process.stdout);
