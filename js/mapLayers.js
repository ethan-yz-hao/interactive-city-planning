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
let sidewalkOpacity = 0.8;

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

// now load the lic_bid data
async function loadWvBidData() {
    const response = await fetch("wv_bid.json");
    const data = await response.json();
    return data.features;
}

async function updateLayers() {
    if (window.deckOverlay) {
        const treesData = await loadTreesData();
        const sidewalksData = await loadSidewalksData();
        const wvBidData = await loadWvBidData();
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
    return new GeoJsonLayer({
        id: "sidewalks-layer",
        data: sidewalksData,
        pickable: true,
        stroked: true,
        filled: true,
        extruded: true,
        lineWidthScale: 20,
        lineWidthMinPixels: 2,
        getLineColor: [50, 50, 50],
        getFillColor: [70, 70, 70, Math.floor(sidewalkOpacity * 255)],
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
