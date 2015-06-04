var got = require('got'),
    xtend = require('xtend'),
    pf = require('printf'),
    queue = require('queue-async');

var q = queue(1);

var D = true;

var defaults = {
    headers: {
        Authorization: pf('Bearer %s', process.env.STRAVA_TOKEN)
    },
    json: true
};

function getPage(page, callback) {
    console.error('loading page %s', page);
    got('https://www.strava.com/api/v3/athlete/activities', xtend(defaults, {
        query: {
            per_page: 20,
            page: page
        }
    }), function(err, res) {
        if (!D || res.length === 200) {
            q.defer(getPage, page + 1);
        }
        callback(err, res);
    });
}

q.defer(getPage, 1);

q.awaitAll(function(err, res) {
    if (err) throw err;

    var flattened = res.reduce(function(memo, item) {
        return memo.concat(item);
    }, []);

    console.error('got %s items', flattened.length);

    console.log(flattened[0]);

    got(pf('https://www.strava.com/api/v3/activities/%s/streams/latlng', flattened[0].id), defaults, function(err, res) {
        console.log(res);
    });
});
