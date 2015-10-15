module.exports = convert;

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
            },
            properties: {}
        };
    })[0];
}
