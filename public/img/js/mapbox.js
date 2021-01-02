/* eslint-disable */
const locations = JSON.parse(document.getElementById('map').dataset.locations);
console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoieXVtbXlmdW5ueWJ1bm55IiwiYSI6ImNramVtZTN1MjF4cnIyem4wZjIybjRxYXMifQ.AuJETQh8UxixgOF206gJJw';

// ANCHOR -- Create MapBox Map --
// NOTE container: set to the ID of the HTML element you want the map to appear inside of, in this case,
//      the default is an ID called 'map', which is why we set a div to have an ID of 'map' in the begining
// NOTE style: this is a link to the map stype you've created in your mapbox account
// NOTE scrollZoom: disables/enables mouse-scroll zooming on the map
// NOTE center: this options sets the starting origin of the map. you must set them as an array, with longitude
//      first, latitude 2nd
// NOTE zoom: sets the starting zoom level for the map
// NOTE interactive: sets whether you can zoom or pan the map
var map = new mapboxgl.Map({
  container: 'map', // 'map' is the default element ID
  style: 'mapbox://styles/yummyfunnybunny/ckjemj62o8xav19s8xopbe3uj',
  scrollZoom: false, // disables mouse-scroll zooming on the map
  // center: [-118.113491, 34.111745],
  // zoom: 5,
  // interactive: false,
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  // Create Map Marker
  const el = document.createElement('div');
  el.className = 'marker';

  // Add Markers to map
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom', // sets the origin of the sprite you are generating
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  // Add popup info
  new mapboxgl.Popup({
    offset: 30,
  }).bounds // Extends map bounds to include current locations
    .extend(loc, coordinates)
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Dat ${loc.day}: ${loc.description}</p>`)
    .addTo(map);
});

// Automatically zoom the map based on the locations
// NOTE the object of options is a list of additional padding you can add to the bounding of the map
map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});
