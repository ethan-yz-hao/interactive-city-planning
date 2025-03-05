/* Tutorial: Configuration
 * This module contains all the constant values and initial settings for the application.
 * Keeping these values separate makes it easier to modify the application behavior.
 */

const INITIAL_VIEW_STATE = {
    longitude: -74.0028294,
    latitude: 40.7336088,
    zoom: 16,
    pitch: 30,
    bearing: 0,
};

const initialQRPosition = [
    INITIAL_VIEW_STATE.longitude,
    INITIAL_VIEW_STATE.latitude,
];

// Global state variables
let showHexagonLayer = false;
let movementRadius = 0.00001;
let manualControl = false;
let QRPosition = [...initialQRPosition];
let QRRotation = 0;
let qrWeight = 1; // Add new variable for QR weight

// Add these variables for the hexagon layer
let hexagonRadius = 30;
let hexagonElevationScale = 10;
