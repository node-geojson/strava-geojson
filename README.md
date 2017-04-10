# strava-geojson

[![Greenkeeper badge](https://badges.greenkeeper.io/tmcw/strava-geojson.svg)](https://greenkeeper.io/)

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
$ strava-geojson YOUR_ACCESS_TOKEN_HERE > my_runs.geojson
```

## node api

```js

var stravaExport = require('strava-export');

stravaExport(STRAVA_TOKEN).pipe(process.stdout);
```
