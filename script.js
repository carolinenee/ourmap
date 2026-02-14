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
    // Check if we're on the last point
    if (currentIndex === places.length - 1) {
        // Show the completion popup
        showCompletionPopup();
    }
    
    currentIndex = (currentIndex + 1) % places.length;
    updateDisplay();
});

// Function to show completion popup
function showCompletionPopup() {
    // Create popup HTML
    const popupHTML = `
        <div id="completion-popup" style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 1000;
            max-width: 500px;
            width: 90%;
            text-align: center;
        ">
            <button id="close-completion-popup" style="
                position: absolute;
                top: 10px;
                right: 10px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                padding: 5px 10px;
            ">×</button> 
            <h2 style="color: #091453; margin-bottom: 15px;">Finito!</h2>
            <p style="color: #333; line-height: 1.6;">
                You Finished all ${places.length} places! But we both know there are many more... and there will be many more to come 💕
                <img src="images/ActionShot.png" alt="Description" style="width: 80%; border-radius: 8px;">
            </p>
        </div>
        
        <div id="completion-overlay" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 999;
        "></div>
    `;
    
    // Add popup to body
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    
    // Close button functionality
    document.getElementById('close-completion-popup').addEventListener('click', closeCompletionPopup);
    document.getElementById('completion-overlay').addEventListener('click', closeCompletionPopup);
}

function closeCompletionPopup() {
    const popup = document.getElementById('completion-popup');
    const overlay = document.getElementById('completion-overlay');
    if (popup) popup.remove();
    if (overlay) overlay.remove();
}

// Popup functionality
document.getElementById('close-popup').addEventListener('click', () => {
    document.getElementById('welcome-popup').style.display = 'none';
    document.getElementById('popup-overlay').style.display = 'none';
});

document.getElementById('popup-overlay').addEventListener('click', () => {
    document.getElementById('welcome-popup').style.display = 'none';
    document.getElementById('popup-overlay').style.display = 'none';
});