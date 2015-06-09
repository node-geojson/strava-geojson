# strava-geojson

Export runs from [Strava](https://www.strava.com/) into
[GeoJSON](http://geojson.org/).

## install

With node,

    npm i -g strava-geojson

## node api

```js

var stravaExport = require('strava-export');

stravaExport(STRAVA_TOKEN).pipe(process.stdout);
```
