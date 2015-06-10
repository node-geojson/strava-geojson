var got = require('got'),
    c = require('./constants');

module.exports.getActivitiesPage = function(token, page, callback) {
  got(c.ACTIVITIES_URL, {
      json: true,
      query:{
        per_page: 100,
        access_token: token,
        page: page
    }
  }, callback);
};

module.exports.getActivity = function(token, id, callback) {
    got('https://www.strava.com/api/v3/activities/' + id + '/streams/latlng', {
        json: true,
        query: {
            access_token: token
        }
    }, callback);
};
