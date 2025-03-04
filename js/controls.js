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

    // // Scale slider
    // document
    //     .getElementById("scale-slider")
    //     .addEventListener("input", (event) => {
    //         movementRadius = parseFloat(event.target.value);
    //         document.getElementById("scale-value").textContent =
    //             movementRadius.toFixed(6);
    //     });

    // // Weight slider
    // document
    //     .getElementById("weight-slider")
    //     .addEventListener("input", (event) => {
    //         qrWeight = parseInt(event.target.value);
    //         document.getElementById("weight-value").textContent = qrWeight;
    //         updateLayers();
    //     });

    // // Manual control toggle
    // document
    //     .getElementById("manual-toggle")
    //     .addEventListener("change", (event) => {
    //         manualControl = event.target.checked;
    //         document.getElementById("manual-controls").style.display =
    //             manualControl ? "block" : "none";
    //         updateLayers();
    //     });

    // // Manual movement buttons
    // document.getElementById("move-up").addEventListener("click", () => {
    //     QRPosition[1] += 0.0001;
    //     updateLayers();
    // });

    // document.getElementById("move-down").addEventListener("click", () => {
    //     QRPosition[1] -= 0.0001;
    //     updateLayers();
    // });

    // document.getElementById("move-left").addEventListener("click", () => {
    //     QRPosition[0] -= 0.0001;
    //     updateLayers();
    // });

    // document.getElementById("move-right").addEventListener("click", () => {
    //     QRPosition[0] += 0.0001;
    //     updateLayers();
    // });

    // Sidewalk width slider
    document
        .getElementById("sidewalk-width-slider")
        .addEventListener("input", (event) => {
            sidewalkWidth = parseFloat(event.target.value);
            console.log("Sidewalk width changed to:", sidewalkWidth);
            document.getElementById("sidewalk-width-value").textContent =
                sidewalkWidth.toFixed(1);
            updateLayers();
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

// function updateTooltip({ object, x, y }) {
//     const tooltip = document.getElementById("tooltip");
//     if (object) {
//         tooltip.style.display = "block";
//         tooltip.style.left = `${x}px`;
//         tooltip.style.top = `${y}px`;
//         tooltip.innerHTML = `
//             <strong>Tree Info:</strong><br>
//             Genus Species: ${object.properties.GenusSpecies}<br>
//             DBH: ${object.properties.DBH}<br>
//             Condition: ${object.properties.TPCondition}<br>
//             Planted Date: ${object.properties.PlantedDate || "N/A"}<br>
//             Risk Rating: ${object.properties.RiskRating || "N/A"}
//         `;
//     } else {
//         tooltip.style.display = "none";
//     }
// }

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
