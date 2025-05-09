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
let selectedTime = "9"; // Default to 9 AM
let selectedPolygonId = null; // Track the currently selected polygon
let kpfuiDevDataCache = null; // Cache for the data

async function loadKpfuiDevData() {
    if (!kpfuiDevDataCache) {
        const response = await fetch("sidewalks.json");
        const data = await response.json();

        // Add original_width_ft property to each feature if needed
        data.features.forEach((feature) => {
            if (
                feature.properties.est_width_ft &&
                !feature.properties.original_width_ft
            ) {
                feature.properties.original_width_ft =
                    feature.properties.est_width_ft;
            }
        });

        kpfuiDevDataCache = data.features;
    }
    return JSON.parse(JSON.stringify(kpfuiDevDataCache)); // Return a deep copy
}

// now load the lic_bid data
async function loadWvBidData() {
    const response = await fetch("wv_bid.json");
    const data = await response.json();
    return data.features;
}

async function updateLayers() {
    if (window.deckOverlay) {
        // const treesData = await loadTreesData();
        // const sidewalksData = await loadSidewalksData();
        const wvBidData = await loadWvBidData();
        let kpfuiDevData = await loadKpfuiDevData();

        // Update the selected state in the data
        kpfuiDevData = kpfuiDevData.map((feature) => {
            // Add a selected property to each feature
            feature.properties.selected =
                feature.properties.polygon_id === selectedPolygonId;
            return feature;
        });

        const layers = [];

        if (showHexagonLayer) {
            // Create data points for the hexagon layer from the sidewalk polygons
            const hexagonData = [];

            kpfuiDevData.forEach((feature) => {
                if (feature.geometry.type === "Polygon") {
                    // Get the centroid of the polygon
                    const coordinates = feature.geometry.coordinates[0];
                    let centroidX = 0;
                    let centroidY = 0;

                    for (let i = 0; i < coordinates.length; i++) {
                        centroidX += coordinates[i][0];
                        centroidY += coordinates[i][1];
                    }

                    centroidX /= coordinates.length;
                    centroidY /= coordinates.length;

                    // Get the crowdedness value (inverse of area per person)
                    const areaPerPerson =
                        feature.properties[`est_area_p_${selectedTime}`];

                    // Higher weight for more crowded areas (lower area per person)
                    // Use a reasonable default if data is missing
                    let weight = 1;
                    if (
                        areaPerPerson !== undefined &&
                        areaPerPerson !== null &&
                        areaPerPerson > 0
                    ) {
                        // Inverse relationship - less area per person means more crowded
                        weight = 100 / areaPerPerson;
                    }

                    hexagonData.push({
                        position: [centroidX, centroidY],
                        weight: weight,
                    });
                }
            });

            layers.push(
                new HexagonLayer({
                    id: "hexagon-layer",
                    data: hexagonData,
                    getPosition: (d) => d.position,
                    getElevationWeight: (d) => d.weight,
                    getColorWeight: (d) => d.weight,
                    radius: hexagonRadius,
                    elevationScale: hexagonElevationScale,
                    extruded: true,
                    pickable: true,
                    opacity: 0.8,
                    coverage: 0.9,
                    upperPercentile: 90,
                    material: {
                        ambient: 0.64,
                        diffuse: 0.6,
                        shininess: 32,
                        specularColor: [51, 51, 51],
                    },
                })
            );
        } else {
            // layers.push(createScatterplotLayer(treesData));
            // layers.push(createSidewalksLayer(sidewalksData));
            layers.push(createWvBidLayer(wvBidData));
            layers.push(createKpfuiDevLayer(kpfuiDevData));
        }

        // layers.push(createQRPositionLayer());
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

// Add this function to calculate color based on area per person
function getColorForAreaPerPerson(areaPerPerson) {
    // Default to middle value if data is missing
    if (areaPerPerson === undefined || areaPerPerson === null) {
        return [128, 0, 128, 255]; // Default purple
    }

    // Clamp value between 0 and 300
    const value = Math.max(0, Math.min(300, areaPerPerson));

    // Normalize to 0-1 range
    const normalizedValue = value / 300;

    // Reverse the normalized value to make low values yellow and high values purple
    const reversedValue = 1 - normalizedValue;

    // Use d3's inferno color scale in reverse
    const color = d3.color(d3.interpolateInferno(reversedValue));

    return [
        color.r,
        color.g,
        color.b,
        255, // Full opacity
    ];
}

function createKpfuiDevLayer(kpfuiDevData) {
    return new GeoJsonLayer({
        id: "kpfui-dev-layer",
        data: kpfuiDevData,
        pickable: true,
        stroked: true,
        filled: true,
        getLineColor: (d) => {
            // Return red if this polygon is selected, otherwise default color
            return d.properties.selected ? [255, 0, 0, 255] : null;
        },
        getFillColor: (d) => {
            // Get the area per person for the selected time
            const areaPerPerson = d.properties[`est_area_p_${selectedTime}`];
            return getColorForAreaPerPerson(areaPerPerson);
        },
        getRadius: 100,
        getLineWidth: 0.5,
        onHover: updateSidewalkTooltip,
        onClick: (info) => {
            if (info.object) {
                // Toggle selection - if clicking the same polygon, deselect it
                if (selectedPolygonId === info.object.properties.polygon_id) {
                    selectedPolygonId = null;
                } else {
                    selectedPolygonId = info.object.properties.polygon_id;
                }
                // Refresh the layer to show the selection change
                updateLayers();
            }
        },
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

    // Add this line to load layers after map initialization
    await updateLayers();
}

// Add this function to update the selected polygon's geometry based on width multiplier
function updateSelectedPolygonGeometry(widthMultiplier) {
    if (!kpfuiDevDataCache || selectedPolygonId === null) return;

    // Find the selected polygon in the cache
    const selectedPolygon = kpfuiDevDataCache.find(
        (feature) => feature.properties.polygon_id === selectedPolygonId
    );

    if (selectedPolygon && selectedPolygon.geometry.type === "Polygon") {
        // Store original geometry if not already stored
        if (!selectedPolygon.originalGeometry) {
            selectedPolygon.originalGeometry = JSON.parse(
                JSON.stringify(selectedPolygon.geometry)
            );
        }

        // If multiplier is 1.0, restore original geometry
        if (widthMultiplier === 1.0 && selectedPolygon.originalGeometry) {
            selectedPolygon.geometry = JSON.parse(
                JSON.stringify(selectedPolygon.originalGeometry)
            );
            return;
        }

        // Get the coordinates of the outer ring
        const coordinates = selectedPolygon.geometry.coordinates[0];
        if (coordinates.length < 3) return; // Need at least 3 points for a polygon

        // Calculate centroid
        let centroidX = 0;
        let centroidY = 0;
        for (let i = 0; i < coordinates.length; i++) {
            centroidX += coordinates[i][0];
            centroidY += coordinates[i][1];
        }
        centroidX /= coordinates.length;
        centroidY /= coordinates.length;

        // Find the shortest distance from centroid to any edge
        let shortestDirection = { x: 0, y: 0 };
        let shortestDistance = Infinity;

        for (let i = 0; i < coordinates.length; i++) {
            const p1 = coordinates[i];
            const p2 = coordinates[(i + 1) % coordinates.length];

            // Calculate the distance from centroid to this edge
            const distance = distanceToLine(
                centroidX,
                centroidY,
                p1[0],
                p1[1],
                p2[0],
                p2[1]
            );

            if (distance < shortestDistance) {
                shortestDistance = distance;

                // Calculate the direction vector perpendicular to this edge
                const dx = p2[0] - p1[0];
                const dy = p2[1] - p1[1];

                // Perpendicular vector
                shortestDirection = {
                    x: -dy,
                    y: dx,
                };

                // Normalize the direction vector
                const length = Math.sqrt(
                    shortestDirection.x * shortestDirection.x +
                        shortestDirection.y * shortestDirection.y
                );
                shortestDirection.x /= length;
                shortestDirection.y /= length;

                // Make sure the direction points outward from the polygon
                const midX = (p1[0] + p2[0]) / 2;
                const midY = (p1[1] + p2[1]) / 2;
                const toCentroidX = centroidX - midX;
                const toCentroidY = centroidY - midY;

                // If the dot product is negative, flip the direction
                if (
                    toCentroidX * shortestDirection.x +
                        toCentroidY * shortestDirection.y <
                    0
                ) {
                    shortestDirection.x = -shortestDirection.x;
                    shortestDirection.y = -shortestDirection.y;
                }
            }
        }

        // Now scale the polygon along the shortest direction
        const scaleFactor = widthMultiplier - 1.0;

        // Use the original geometry as the base
        if (selectedPolygon.originalGeometry) {
            const originalCoords =
                selectedPolygon.originalGeometry.coordinates[0];

            for (let i = 0; i < coordinates.length; i++) {
                // Get the original point
                const origPoint = originalCoords[i];

                // Vector from centroid to point
                const vx = origPoint[0] - centroidX;
                const vy = origPoint[1] - centroidY;

                // Project this vector onto the shortest direction
                const projection =
                    vx * shortestDirection.x + vy * shortestDirection.y;

                // Scale the projection
                const scaledProjection = projection * scaleFactor;

                // Add the scaled projection to the original point
                coordinates[i][0] =
                    origPoint[0] + scaledProjection * shortestDirection.x;
                coordinates[i][1] =
                    origPoint[1] + scaledProjection * shortestDirection.y;
            }
        }
    }
}

// Helper function to calculate distance from a point to a line segment
function distanceToLine(px, py, x1, y1, x2, y2) {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;

    if (len_sq !== 0) {
        param = dot / len_sq;
    }

    let xx, yy;

    if (param < 0) {
        xx = x1;
        yy = y1;
    } else if (param > 1) {
        xx = x2;
        yy = y2;
    } else {
        xx = x1 + param * C;
        yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;

    return Math.sqrt(dx * dx + dy * dy);
}

// Update the updateSelectedPolygonWidth function to also update geometry
function updateSelectedPolygonWidth(widthMultiplier) {
    if (!kpfuiDevDataCache || selectedPolygonId === null) return;

    // Find the selected polygon in the cache
    const selectedPolygon = kpfuiDevDataCache.find(
        (feature) => feature.properties.polygon_id === selectedPolygonId
    );

    if (selectedPolygon) {
        const props = selectedPolygon.properties;

        // Store the original width if not already stored
        if (!props.original_width_ft) {
            props.original_width_ft = props.est_width_ft;
        }

        // Update the width based on the multiplier and original width
        const originalWidth = props.original_width_ft;
        props.est_width_ft = originalWidth * widthMultiplier;

        // Calculate the new area based on length and new width
        const length = props.est_length_ft;
        if (length) {
            const newArea = props.est_width_ft * length;
            props.est_area_ft = newArea;

            // Update area per person for each time period
            const times = ["9", "12", "19"];
            times.forEach((time) => {
                const pedestrianCount = props[`p_total_${time}`] || 0;
                // Avoid division by zero
                if (pedestrianCount > 0) {
                    props[`est_area_p_${time}`] = newArea / pedestrianCount;
                } else {
                    props[`est_area_p_${time}`] = newArea; // If no pedestrians, area per person is just the area
                }
            });
        }

        // Update the geometry of the polygon
        updateSelectedPolygonGeometry(widthMultiplier);
    }
}
