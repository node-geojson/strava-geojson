var util = require('util'),
    Readable = require('readable-stream'),
    xhr = require('./xhr.js');

util.inherits(Source, Readable);

function Source(opt) {
    opt.objectMode = true;
    Readable.call(this, opt);
    this.page = 1;
    this.STRAVA_TOKEN = opt.STRAVA_TOKEN;
}

Source.prototype._read = function() {
    this.pause();
    xhr.getActivitiesPage(this.STRAVA_TOKEN, this.page, function(err, res) {
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

module.exports = Source;
