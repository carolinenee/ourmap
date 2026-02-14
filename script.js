mapboxgl.accessToken = "pk.eyJ1IjoiY2Fyb2xpbmVuZWUiLCJhIjoiY201b2RhZmxtMGthajJucHRxcW5heGxiNyJ9.NMKAQoQvhYJ8RQq0NQuYkA";
const map = new mapboxgl.Map({
    container: 'my-map',
    style: 'mapbox://styles/carolinenee/cm8gbeqjq00cr01pa45oudfs7',
    center: [-79.39, 43.66],
    zoom: 13,
});

let places = [];
let currentIndex = 0;

map.on('load', () => {
    map.addSource('fun_places', {
        type: 'geojson',
        data: 'https://raw.githubusercontent.com/carolinenee/ourmap/refs/heads/main/places.geojson'
    });
    
    // Fetch the GeoJSON data to store in our places array
    fetch('https://raw.githubusercontent.com/carolinenee/ourmap/refs/heads/main/places.geojson')
        .then(response => response.json())
        .then(data => {
            places = data.features;
            if (places.length > 0) {
                updateDisplay();
            }
        });
    
  map.addLayer({
    'id': 'place-point',
    'type': 'circle',
    'source': 'fun_places',
    'paint': {
        'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 3,
            15, 5,
            20, 10
        ],
        'circle-color': 
            '#c6e5fc'
    }
});

// Add highlight layer for current point
map.addLayer({
    'id': 'place-point-highlight',
    'type': 'circle',
    'source': 'fun_places',
    'paint': {
        'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, 3,
            15, 5,
            20, 10
        ],
        'circle-color': '#ffee39', // Green color
    },
    'filter': ['==', ['get', 'place name'], ''] // Initially show nothing
});
    
    map.addLayer({
        'id': 'cafes-text', 
        'type': 'symbol',
        'source': 'fun_places',
        'layout': {
            'text-field': ['get', 'place name'],
            'text-size': 12,
            'text-anchor': 'top'
        },
        'paint': {
            'text-color': '#000000',
            'text-halo-color': '#fef4fa',
            'text-halo-width': 1
        }
    });
    
    map.setLayoutProperty('cafes-text', 'visibility', 'none');
});

map.on('click', 'place-point', (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();
    const placeName = e.features[0].properties['place name'];
    const month = e.features[0].properties.month;

    new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(`<strong>${placeName}</strong><br>Month: ${month}`)
        .addTo(map);
});

map.addControl(new mapboxgl.NavigationControl());
map.addControl(new mapboxgl.FullscreenControl());

// Navigation functions
function updateDisplay() {
    if (places.length === 0) return;
    
    const currentPlace = places[currentIndex];
    const coords = currentPlace.geometry.coordinates;
    const placeName = currentPlace.properties['place name'];
    
    // Update display
    document.getElementById('point-name').textContent = placeName;
    document.getElementById('point-counter').textContent = `${currentIndex + 1} / ${places.length}`;
    
    // Highlight current point by filtering
    map.setFilter('place-point-highlight', ['==', ['get', 'place name'], placeName]);
    
    // Fly to the point
    map.flyTo({
        center: coords,
        zoom: 14,
        duration: 4000
    });
    
    /* Optional: Show a popup
    new mapboxgl.Popup()
        .setLngLat(coords)
        .setHTML(`<strong>${placeName}</strong>`)
        .addTo(map);*/
}

document.getElementById('prev-btn').addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + places.length) % places.length;
    updateDisplay();
});

document.getElementById('next-btn').addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % places.length;
    updateDisplay();
});