var jsonp = require('jsonp'),
    qs = require('querystring'),
    c = require('./constants');

module.exports.getActivitiesPage = function(token, page, callback) {
  jsonp(c.ACTIVITIES_URL + '?' +
    qs.stringify({
        per_page: 100,
        access_token: token,
        page: page
    }), { timeout: 5000 }, callback);
};

module.exports.getActivity = function(token, id, callback) {
    jsonp('https://www.strava.com/api/v3/activities/' + id + '/streams/latlng?' +
    qs.stringify({
        access_token: token
    }), { timeout: 5000 }, callback);
};
