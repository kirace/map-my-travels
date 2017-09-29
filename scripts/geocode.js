var MapboxClient = require('mapbox');
mapboxgl.accessToken = 'pk.eyJ1Ijoia2V2aW5pcmFjZSIsImEiOiJjajY0M2ExZDIxbm1hMzNwOHp0cWpzbjJkIn0.g_KHQKSe60ViArp6hW-2TA';
var client = new MapboxClient(mapboxgl.accessToken);

function getCity(query){
  client.geocodeForward(query, {
    limit: 1
  }, function(err, res) {
    // res is a GeoJSON document with geocoding matches
    console.log(res);
  });
}
