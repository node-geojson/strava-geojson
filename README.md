# strava-geojson

Export runs from [Strava](https://www.strava.com/) into
[GeoJSON](http://geojson.org/).

## get a token

* go to http://www.strava.com/developers
* click 'Manage Your Application'
* show `Your Access Token`
* copy & paste it verbatim

## install

With node,

    npm i -g strava-geojson

## cli

```sh
$ geojson-stream YOUR_ACCESS_TOKEN_HERE > my_runs.geojson
```

## node api

```js

var stravaExport = require('strava-export');

stravaExport(STRAVA_TOKEN).pipe(process.stdout);
```
