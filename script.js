mapboxgl.accessToken = "pk.eyJ1IjoiY2Fyb2xpbmVuZWUiLCJhIjoiY201b2RhZmxtMGthajJucHRxcW5heGxiNyJ9.NMKAQoQvhYJ8RQq0NQuYkA";
const map = new mapboxgl.Map({
    container: 'my-map', // map container ID
    style: 'mapbox://styles/carolinenee/cm7uuha4i01rf01qo19chh4m6', // monochromatic basemap style 
    center: [-79.39, 43.66], // starting position [lng, lat] of toronto
    zoom: 13, // starting zoom
});

map.on('load', () => { //not super useful as a layer i just wanted to make sure i could add vector tilesets 
    map.addSource('toronto_neighbourhoods', { //data of neighborhoods from city of toronto open data library that i made into a vector tileset
        "type": 'vector',
        "url": 'mapbox://carolinenee.3bs4acz8' // link to the vector tileset on mapbox 
    });

    map.addLayer({ //styling for the toronto neighborhoods layer
        'id': 'neighborhood_visualised', 
        'type': 'line',
        'source': 'toronto_neighbourhoods',
        'source-layer': 'Neighbourhoods_-_4326-aanwor', // name of the layer in mapbox
        'paint': {
            'line-color': '#808080', //color for the neighborhood outline lines 
        }
    });
    map.addSource('cafes_data', { //loading geojson cafe data made with geojson.io 
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/carolinenee/lab3/refs/heads/main/cafes.geojson' // link to git hub raw data file
    });
    map.addLayer({
        'id': 'cafes-point',
        'type': 'circle',
        'source': 'cafes_data',
        'paint': {
            'circle-radius': [
                'interpolate', // Use interpolation to smoothly transition between values
                ['linear'],   // Linear interpolation
                ['zoom'],     // Based on the zoom level
                10, 3,       // At zoom level 10, circle radius is 3
                15, 5,       // At zoom level 15, circle radius is 5
                20, 10       // At zoom level 20, circle radius is 10
            ],
            'circle-color': [
                'match',
                ['get', 'rating'], //finds the rating associated with each point in the GeoJson
                5, '#e6008b', // ranking number as associated colour
                4, '#fa68c0', 
                3, '#feb6e2', 
                2, '#fadcef', 
                '#ffffff'     // Default to black
            ]
        }
    });
    map.addLayer({ // same as the circle data above but instead displays the names instead of circles
        'id': 'cafes-text', 
        'type': 'symbol',
        'source': 'cafes_data',
        'layout': {
            'text-field': ['get', 'name'],
            'text-size': 12,
            'text-anchor': 'top'
        },
        'paint': {
            'text-color': '#000000', // black text
            'text-halo-color': '#fef4fa', // halo for visibility
            'text-halo-width': 1
        }
    });
    map.setLayoutProperty('cafes-text', 'visibility', 'none'); // innitially dont show the names 
});
map.on('click', 'cafes-point', (e) => { //creates a variable for the information we have in our data  
    const coordinates = e.features[0].geometry.coordinates.slice();
    const name = e.features[0].properties.name;
    const rating = e.features[0].properties.rating;
    const openingTime = e.features[0].properties['opening time'];
    const closingTime = e.features[0].properties['closing time'];

    new mapboxgl.Popup()
        .setLngLat(coordinates) // popup will show up at the cafe's coordinates 
        .setHTML(`<strong>${name}</strong><br>Rating: ${rating}/5<br>Open: ${openingTime} - ${closingTime}`) //contents of the popup, things with $ are values from the geoJson
        .addTo(map);
});

map.addControl(new mapboxgl.NavigationControl()); // adds the nagivation options at top right of map (default)
map.addControl(new mapboxgl.FullscreenControl()); // adds the option to make map full screen 

document.getElementById('toggle-labels').addEventListener('click', () => {
    // Check the current visibility of the text layer
    const textVisibility = map.getLayoutProperty('cafes-text', 'visibility');

    // Toggle visibility
    if (textVisibility === 'none') {
        // Show text labels and hide circles
        map.setLayoutProperty('cafes-text', 'visibility', 'visible');
        map.setLayoutProperty('cafes-point', 'visibility', 'none');
    } else {
        // Show circles and hide text labels
        map.setLayoutProperty('cafes-text', 'visibility', 'none');
        map.setLayoutProperty('cafes-point', 'visibility', 'visible');
    }
});