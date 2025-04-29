/* Tutorial: Controls
 * This module handles all user interface controls and their event listeners.
 * It includes layer toggling, manual controls, and tooltip functionality.
 */

function initializeControls() {
    // Layer toggle
    document.getElementById("toggle").addEventListener("change", (event) => {
        showHexagonLayer = event.target.checked;
        updateLayers();
    });
    // Scale slider
    document
        .getElementById("scale-slider")
        .addEventListener("input", (event) => {
            hexagonRadius = parseInt(event.target.value);
            document.getElementById("scale-value").textContent = hexagonRadius;
            updateLayers();
        });

    // Elevation scale slider
    document
        .getElementById("elevation-slider")
        .addEventListener("input", (event) => {
            hexagonElevationScale = parseInt(event.target.value);
            document.getElementById("elevation-value").textContent =
                hexagonElevationScale;
            updateLayers();
        });

    // Sidewalk width slider
    document
        .getElementById("sidewalk-width-slider")
        .addEventListener("input", (event) => {
            sidewalkWidth = parseFloat(event.target.value);
            // console.log("Sidewalk width multiplier changed to:", sidewalkWidth);
            document.getElementById("sidewalk-width-value").textContent =
                sidewalkWidth.toFixed(1);

            // Update the selected polygon's width and related properties
            if (selectedPolygonId !== null) {
                updateSelectedPolygonWidth(sidewalkWidth);
            }

            updateLayers();
        });

    // Reset width button
    document
        .getElementById("reset-width-button")
        .addEventListener("click", () => {
            if (selectedPolygonId !== null) {
                // Reset the slider to 1.0 (original width)
                document.getElementById("sidewalk-width-slider").value = 1.0;
                sidewalkWidth = 1.0;
                document.getElementById("sidewalk-width-value").textContent =
                    "1.0";

                // Reset the selected polygon's width to original
                updateSelectedPolygonWidth(1.0);

                // Update the visualization
                updateLayers();
            }
        });

    // Time selector
    document
        .getElementById("time-selector")
        .addEventListener("change", (event) => {
            selectedTime = event.target.value;
            console.log("Time changed to:", selectedTime);
            updateLayers();
        });
}

function updateSidewalkTooltip({ object, x, y }) {
    const tooltip = document.getElementById("tooltip");
    if (object && object.properties) {
        const props = object.properties;
        const time = selectedTime;

        tooltip.style.display = "block";
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
        tooltip.innerHTML = `
            <strong>Sidewalk Area: ${
                props.est_area_ft?.toFixed(1) || "N/A"
            } sqft</strong><br>
            <strong>Sidewalk Width: ${
                props.est_width_ft?.toFixed(1) || "N/A"
            } ft</strong><br>
            <strong>Area per Person: ${
                props[`est_area_p_${time}`]?.toFixed(1) || "N/A"
            } sqft/person</strong><br>
            <strong>Pedestrian Traffic: ${
                props[`p_total_${time}`] || "0"
            } /hr</strong><br>
            <ul style="margin: 5px 0; padding-left: 20px;">
                <li>Pedestrian Queue: ${
                    props[`p_queue_${time}`] || "0"
                } /hr</li>
                <li>Restaurant/Bar: ${props[`rest_${time}`] || "0"} /hr</li>
                <li>Supermarket: ${props[`supe_${time}`] || "0"} /hr</li>
                <li>Convenience/Pharmacy: ${
                    props[`phar_${time}`] || "0"
                } /hr</li>
                <li>Bank: ${props[`bank_${time}`] || "0"} /hr</li>
                <li>Office: ${props[`offi_${time}`] || "0"} /hr</li>
                <li>Subway: ${props[`subw_${time}`] || "0"} /hr</li>
            </ul>
        `;
    } else {
        tooltip.style.display = "none";
    }
}
