/* Tutorial: Controls
 * This module handles all user interface controls and their event listeners.
 * It includes layer toggling, manual controls, and tooltip functionality.
 */

function initializeControls() {
    // Add this at the beginning of your function
    const sidewalkSlider = document.getElementById("sidewalk-opacity-slider");

    if (sidewalkSlider) {
        sidewalkSlider.addEventListener("input", (event) => {
            sidewalkOpacity = parseFloat(event.target.value);
            document.getElementById("sidewalk-opacity-value").textContent =
                sidewalkOpacity.toFixed(1);
            updateLayers();
        });
    } else {
        console.error("Sidewalk opacity slider element not found!");
    }

    // Layer toggle
    document.getElementById("toggle").addEventListener("change", (event) => {
        showHexagonLayer = event.target.checked;
        updateLayers();
    });

    // Scale slider
    document
        .getElementById("scale-slider")
        .addEventListener("input", (event) => {
            movementRadius = parseFloat(event.target.value);
            document.getElementById("scale-value").textContent =
                movementRadius.toFixed(6);
        });

    // Weight slider
    document
        .getElementById("weight-slider")
        .addEventListener("input", (event) => {
            qrWeight = parseInt(event.target.value);
            document.getElementById("weight-value").textContent = qrWeight;
            updateLayers();
        });

    // Manual control toggle
    document
        .getElementById("manual-toggle")
        .addEventListener("change", (event) => {
            manualControl = event.target.checked;
            document.getElementById("manual-controls").style.display =
                manualControl ? "block" : "none";
            updateLayers();
        });

    // Manual movement buttons
    document.getElementById("move-up").addEventListener("click", () => {
        QRPosition[1] += 0.0001;
        updateLayers();
    });

    document.getElementById("move-down").addEventListener("click", () => {
        QRPosition[1] -= 0.0001;
        updateLayers();
    });

    document.getElementById("move-left").addEventListener("click", () => {
        QRPosition[0] -= 0.0001;
        updateLayers();
    });

    document.getElementById("move-right").addEventListener("click", () => {
        QRPosition[0] += 0.0001;
        updateLayers();
    });
}

function updateTooltip({ object, x, y }) {
    const tooltip = document.getElementById("tooltip");
    if (object) {
        tooltip.style.display = "block";
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
        tooltip.innerHTML = `
            <strong>Tree Info:</strong><br>
            Genus Species: ${object.properties.GenusSpecies}<br>
            DBH: ${object.properties.DBH}<br>
            Condition: ${object.properties.TPCondition}<br>
            Planted Date: ${object.properties.PlantedDate || "N/A"}<br>
            Risk Rating: ${object.properties.RiskRating || "N/A"}
        `;
    } else {
        tooltip.style.display = "none";
    }
}
