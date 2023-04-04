const map = L.map('map').setView([8.914589109434269, 76.80816650390625], 11);

// Map switcher 
// OpenStreet Map layer (default basemap)
let streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

//Satellite imagery layer
let satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}')

// Open TopoMap layer
let openTopo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',);

//Metrix layer 
let Jawg_Matrix = L.tileLayer('https://{s}.tile.jawg.io/jawg-matrix/{z}/{x}/{y}{r}.png?access-token={accessToken}', {
  accessToken: 'EOF033CTrZHxs66tCdc164hkhLiy8E6JRgnsRpANmcf0Coq5kkbvDqdZR6z6knSo'
});

// create an object to hold layer names as you want them to appear in the basemap switcher list
let basemapControl = {
  "Streets": streets,
  "Satellite": satellite,
  "Topography": openTopo,
  "Dark Metrix": Jawg_Matrix
}

// display the control (switcher list) on the map, by default in the top right corner
L.control.layers(basemapControl).addTo(map)

// Kottarakkara
let kottarakkaraLayer = L.geoJSON(kottarakkara, {
  style: {
    "fill": 0,
    "color": "#41afc8"
  }
}).addTo(map);

// Define Hospital Layer from Hospital Data
const hospitalLayer = L.geoJSON(hospitalData)

// Button for Hospital Data
const hospitalLayerButton = L.easyButton({
  states: [{
    stateName: 'show-hospital',        // name the state
    icon: '<i class="fa-solid fa-hospital"></i>',
    title: 'Show all Hospitals',
    onClick: function (btn, map) {       // callback
      hospitalLayer.addTo(map);
      // Define Popup for each feature
      hospitalLayer.eachLayer(function (layer) {
        const name = layer.feature.properties.name;
        layer.bindPopup('<b>' + name + '</b>');
      });
      btn.state('hide-hospital');    // change state on click!
    }
  }, {
    stateName: 'hide-hospital',
    icon: '<i class="fa-solid fa-eye-slash"></i>',
    title: 'Hide all Hospitals',
    onClick: function (btn, map) {
      map.removeLayer(hospitalLayer)
      routeFindingButton.state('routing-on'); // change state of routeFindingButton
      btn.state('show-hospital');     // change state on click!
      map.off('click', routeFinding); //switching off routing
      markers.forEach(function(marker) { map.removeLayer(marker); }); // removing popup
      routingControl.getPlan().setWaypoints([]); // removig royte from layer 
    }
  }]
}).addTo(map);


// Nearest Neighbor index
let pointIndex = leafletKnn(hospitalLayer)

// Rooting
let routingControl = L.Routing.control({
  waypoints: []
}).addTo(map);

// Declaring a empty arra to store Marker -2
let markers = [];

// Function for Routing
function routeFinding(evt) {

  // Finding Nearest Neighbor 
  let nearestResult = pointIndex.nearest(evt.latlng, 1)[0];
  nearestResult.layer.bindPopup().openPopup()
  hospitalLayer.eachLayer(function (layer) {
    const name = layer.feature.properties.name;
    layer.bindPopup('<b>Nearest Hospital is : ' + name + '</b>');
  });

  // Assigning Nearest Neighbor coordinates to First Point(Marker -1)
  let nearestNeighbor = nearestResult.layer.getLatLng();

  // Assigning coordinates of Clicked point (For Marker -2)
  let marker = L.marker([evt.latlng.lat, evt.latlng.lng]).addTo(map);
  markers.push(marker);

  // Removing Multiple Markers
  if (markers.length === 2) {
    map.removeLayer(markers[0]);
    markers.splice(0, 1);
  };

  // Setting Marker 1 and 2 into Rooting Controls 
  routingControl.setWaypoints([
    markers[0].getLatLng(),
    nearestNeighbor
  ]);
};

// Routing Button
const routeFindingButton = L.easyButton({
  states: [{
    stateName: 'routing-on',
    icon: '<i class="fa-solid fa-location-dot"></i>',
    title: 'Pick a Location',
    onClick: function (btn, map) {
      console.log ("onnn")
      if (map.hasLayer(hospitalLayer)) {
        map.on('click', routeFinding);
        btn.state('routing-off');
      } else {
        alert("Oops! The hospital layer is not currently visible on the map. Please add the layer to view hospital locations.")
        map.off('click', routeFinding);
      }
      
    }
  }, {
    stateName: 'routing-off',
    icon: '<i class="fa-solid fa-trash"></i>',
    title: 'Remove Location',
    onClick: function (btn, map) {
      console.log ("offf")
      map.off('click', routeFinding);
      markers.forEach(function(marker) { map.removeLayer(marker); }); // removing popup
      routingControl.getPlan().setWaypoints([]); // removig royte from layer 
      btn.state('routing-on');
    }
  }]
}).addTo(map);
