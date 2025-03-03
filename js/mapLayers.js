/* Tutorial: Map Layers
 * This module handles the deck.gl layers and map initialization.
 * It includes functions for creating and updating various visualization layers.
 */

const {
    DeckGL,
    HexagonLayer,
    MapboxOverlay,
    LineLayer,
    ScatterplotLayer,
    GeoJsonLayer,
} = deck;

// Add this variable at the top of the file with other global variables
let sidewalkWidth = 1.0; // Default width multiplier

async function loadTreesData() {
    const response = await fetch("trees.json");
    const data = await response.json();
    return data.features;
}

async function loadSidewalksData() {
    const response = await fetch("sidewalks.json");
    const data = await response.json();
    return data.features;
}

async function loadKpfuiDevData() {
    const response = await fetch("kpfui_dev.json");
    const data = await response.json();
    return data.features;
}

// now load the lic_bid data
async function loadWvBidData() {
    const response = await fetch("wv_bid.json");
    const data = await response.json();
    return data.features;
}

// Add this function to buffer the sidewalk geometries
function bufferSidewalks(sidewalksData, bufferFactor) {
    console.log("Buffering sidewalks with factor:", bufferFactor);
    // Create a deep copy of the data to avoid modifying the original
    const bufferedData = JSON.parse(JSON.stringify(sidewalksData));

    // Apply buffer to each feature
    bufferedData.forEach((feature) => {
        // For Polygon geometries
        if (feature.geometry.type === "Polygon") {
            // Scale the polygon from its centroid
            const coordinates = feature.geometry.coordinates[0]; // Outer ring
            if (coordinates.length < 3) return; // Skip if not enough points

            // Calculate centroid
            let centroidX = 0;
            let centroidY = 0;
            for (let i = 0; i < coordinates.length; i++) {
                centroidX += coordinates[i][0];
                centroidY += coordinates[i][1];
            }
            centroidX /= coordinates.length;
            centroidY /= coordinates.length;

            // Scale each point relative to the centroid
            for (let i = 0; i < coordinates.length; i++) {
                const point = coordinates[i];
                const dx = point[0] - centroidX;
                const dy = point[1] - centroidY;

                // Apply scaling factor (1.0 is original size, >1.0 expands, <1.0 shrinks)
                const scaleFactor = 1.0 + (bufferFactor - 1.0) * 0.1; // Adjust sensitivity

                // Update coordinates
                coordinates[i] = [
                    centroidX + dx * scaleFactor,
                    centroidY + dy * scaleFactor,
                ];
            }
        }
    });

    return bufferedData;
}

async function updateLayers() {
    if (window.deckOverlay) {
        const treesData = await loadTreesData();
        const sidewalksData = await loadSidewalksData();
        const wvBidData = await loadWvBidData();
        const kpfuiDevData = await loadKpfuiDevData();
        const layers = [];

        if (showHexagonLayer) {
            layers.push(
                new HexagonLayer({
                    id: "hexagon-layer",
                    data: [
                        ...treesData.map((tree) => ({
                            ...tree,
                            weight: 1,
                        })),
                        {
                            geometry: { coordinates: QRPosition },
                            weight: qrWeight,
                        },
                    ],
                    getPosition: (d) => d.geometry.coordinates,
                    getElevationWeight: (d) => d.weight,
                    radius: 50,
                    elevationScale: 1,
                    extruded: true,
                    pickable: true,
                    opacity: 0.85,
                    colorRange: [
                        [1, 152, 189],
                        [73, 227, 206],
                        [216, 254, 181],
                        [254, 237, 177],
                        [254, 173, 84],
                        [209, 55, 78],
                    ],
                })
            );
        } else {
            layers.push(createScatterplotLayer(treesData));
            layers.push(createSidewalksLayer(sidewalksData));
            layers.push(createWvBidLayer(wvBidData));
            layers.push(createKpfuiDevLayer(kpfuiDevData));
        }

        layers.push(createQRPositionLayer());
        window.deckOverlay.setProps({ layers });
    }
}

// Function to create a geojson layer for the wv_bid data

function createWvBidLayer(wvBidData) {
    return new GeoJsonLayer({
        id: "geojson-layer",
        data: wvBidData,
        pickable: true,
        stroked: true,
        filled: true,
        extruded: true,
        lineWidthScale: 20,
        lineWidthMinPixels: 2,
        getLineColor: [160, 160, 180, 150],
        getFillColor: [140, 170, 180, 50],
        getRadius: 100,
        getLineWidth: 1,
        getElevation: 30,
    });
}

function createSidewalksLayer(sidewalksData) {
    // Apply buffer to create wider sidewalks
    const bufferedSidewalks = bufferSidewalks(sidewalksData, sidewalkWidth);

    return new GeoJsonLayer({
        id: "sidewalks-layer",
        data: bufferedSidewalks,
        pickable: true,
        stroked: true,
        filled: true,
        extruded: true,
        lineWidthScale: 20,
        lineWidthMinPixels: 2,
        getLineColor: [50, 50, 50],
        getFillColor: [70, 70, 70, 200],
        getRadius: 100,
        getLineWidth: 1,
        getElevation: 5,
    });
}

function createKpfuiDevLayer(kpfuiDevData) {
    return new GeoJsonLayer({
        id: "kpfui-dev-layer",
        data: kpfuiDevData,
        pickable: true,
        stroked: true,
        filled: true,
        extruded: true,
        lineWidthScale: 5,
        lineWidthMinPixels: 2,
        getLineColor: [160, 160, 180, 150],
        getFillColor: [140, 170, 180, 50],
        getRadius: 100,
        getLineWidth: 1,
        getElevation: 5,
    });
}
function createScatterplotLayer(treesData) {
    return new ScatterplotLayer({
        id: "scatterplot-layer",
        data: treesData,
        getPosition: (d) => d.geometry.coordinates,
        getFillColor: (d) => {
            const color = d.properties.color;
            return [color >> 16, (color >> 8) & 255, color & 255];
        },
        getRadius: 5,
        pickable: true,
        onHover: updateTooltip,
    });
}

function createQRPositionLayer() {
    return new LineLayer({
        id: "line-layer",
        data: [
            {
                sourcePosition: [QRPosition[0], QRPosition[1], 0],
                targetPosition: [QRPosition[0], QRPosition[1], 1000],
            },
        ],
        getSourcePosition: (d) => d.sourcePosition,
        getTargetPosition: (d) => d.targetPosition,
        getColor: [0, 255, 0],
        getWidth: 5,
    });
}

async function initializeDeckGL() {
    const map = new maplibregl.Map({
        container: "map",
        center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
        zoom: INITIAL_VIEW_STATE.zoom,
        pitch: INITIAL_VIEW_STATE.pitch,
        bearing: INITIAL_VIEW_STATE.bearing,
        style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
    });

    window.deckOverlay = new MapboxOverlay({ layers: [] });
    map.addControl(window.deckOverlay);
}
