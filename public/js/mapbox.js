/* eslint-disable */

export const displayMap = (locations) => {
  // ANCHOR -- Save Access Token --
  mapboxgl.accessToken =
    'pk.eyJ1IjoieXVtbXlmdW5ueWJ1bm55IiwiYSI6ImNrODZwNzQydDA1bjEzZW15NTRqa2NpdnEifQ.6y8NFU2qjw6mTgINZYaRyg';

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
    style: 'mapbox://styles/yummyfunnybunny/ckjlk64r40z9519lixbhrckka',
    scrollZoom: false, // disables mouse-scroll zooming on the map
    // center: [-118.113491, 34.111745],
    // zoom: 5,
    // interactive: false,
  });

  // ANCHOR -- Create Bounds --
  // this will automatically set the bounds of the map based on the locations that we've added to the map
  const bounds = new mapboxgl.LngLatBounds();

  // ANCHOR -- Add Location Markers --
  // this will add all of locations that we saved above onto the map
  locations.forEach((location) => {
    // Create Your Custom Marker
    const marker = document.createElement('div');
    marker.className = 'marker';

    // Add Markers to map
    new mapboxgl.Marker({
      element: marker,
      anchor: 'bottom', // sets the origin of the sprite you are generating
    })
      .setLngLat(location.coordinates)
      .addTo(map);

    // Add popup info
    new mapboxgl.Popup({
      offset: 30,
      closeButton: false,
      closeOnClick: false,
    })
      .setLngLat(location.coordinates)
      .setHTML(`<p>Dat ${location.day}: ${location.description}</p>`)
      .addTo(map);

    bounds.extend(location.coordinates);
  });

  // ANCHOR -- Fit Bounds --
  // Automatically zoom the map to better fit the markers on the map
  // NOTE the object of options is a list of additional padding you can add to the bounding of the map
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
