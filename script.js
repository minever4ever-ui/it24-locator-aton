// =====================================
// 1. INITIALIZE LEAFLET MAP
// =====================================

const map = L.map('map').setView(
    [12.8797, 121.7740], 6
);

// Add OpenStreetMap tiles
L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        maxZoom: 19,
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }
).addTo(map);


// =====================================
// 2. CREATE MARKER LAYER
// =====================================

const markerLayer = L.layerGroup().addTo(map);


// =====================================
// 3. GET HTML ELEMENTS
// =====================================

const form = document.getElementById('searchForm');
const input = document.getElementById('cityInput');
const status = document.getElementById('status');
const button = form.querySelector('button');


// =====================================
// 4. LISTEN FOR SEARCH SUBMISSION
// =====================================

form.addEventListener('submit', async (event) => {

    event.preventDefault();

    const city = input.value.trim();

    // Validate input
    if (city.length < 2) {
        status.textContent =
            'Please enter at least 2 characters.';
        return;
    }

    // Clear previous markers
    markerLayer.clearLayers();

    status.textContent = 'Searching for city...';

    button.disabled = true;

    try {

        // =====================================
        // 5. BUILD API URL
        // =====================================

        const url =
            'https://geocoding-api.open-meteo.com/v1/search?' +
            new URLSearchParams({
                name: city,
                count: '5',
                language: 'en',
                format: 'json'
            });


        // =====================================
        // 6. FETCH DATA FROM API
        // =====================================

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('API request failed.');
        }


        // =====================================
        // 7. CONVERT RESPONSE TO JSON
        // =====================================

        const data = await response.json();

        const locations = data.results ?? [];


        // =====================================
        // 8. CHECK IF RESULTS EXIST
        // =====================================

        if (locations.length === 0) {

            status.textContent =
                'No matching city found. Try another city.';

            return;
        }


        // =====================================
        // 9. CREATE MAP MARKERS
        // =====================================

        const bounds = [];

        locations.forEach((place) => {

            // Get coordinates
            const latitude = place.latitude;
            const longitude = place.longitude;

            const coordinates = [
                latitude,
                longitude
            ];

            bounds.push(coordinates);


            // Create marker
            const marker = L.marker(coordinates);

            marker.addTo(markerLayer);


            // Create safe popup content
            const popupContent = document.createElement('div');

            const placeName = document.createElement('strong');
            placeName.textContent = place.name;

            const countryName = document.createElement('p');
            countryName.textContent =
                'Country: ' + (place.country || 'Unknown');

            const latitudeText = document.createElement('p');
            latitudeText.textContent =
                'Latitude: ' + latitude;

            const longitudeText = document.createElement('p');
            longitudeText.textContent =
                'Longitude: ' + longitude;

            popupContent.appendChild(placeName);
            popupContent.appendChild(countryName);
            popupContent.appendChild(latitudeText);
            popupContent.appendChild(longitudeText);

            marker.bindPopup(popupContent);

        });


        // =====================================
        // 10. ADJUST MAP VIEW
        // =====================================

        if (bounds.length === 1) {

            map.setView(bounds[0], 11);

        } else {

            map.fitBounds(bounds, {
                padding: [35, 35]
            });

        }


        // =====================================
        // 11. DISPLAY SUCCESS MESSAGE
        // =====================================

        status.textContent =
            'Found ' + locations.length +
            ' location(s) for "' + city + '".';

    }

    // =====================================
    // 12. HANDLE ERRORS
    // =====================================

    catch (error) {

        console.error('Error:', error);

        status.textContent =
            'Something went wrong. Please check your internet connection and try again.';

    }

    finally {

        button.disabled = false;

    }

});