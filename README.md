# QR Code Interactive Map Visualization

This project demonstrates an interactive map visualization that uses a QR code as a controller. The application displays tree data on a map using deck.gl, with the ability to control visualization parameters through physical QR code movement captured by your webcam.

## Features

- Real-time QR code detection using OpenCV.js
- Interactive map visualization with deck.gl and MapLibre GL
- Display options: Hexagon aggregation or individual tree points
- Manual or QR-based navigation control
- Adjustable parameters for movement and impact
- Tree data visualization with detailed tooltips

## Project Structure



```
3_lic_trees/
│
├── index.html        # Main HTML structure
├── styles.css        # CSS styles
├── trees.json        # Tree dataset
├── js/
│   ├── config.js     # Configuration settings
│   ├── qrDetection.js # QR code processing
│   ├── mapLayers.js  # Map visualization layers
│   ├── controls.js   # UI controls and interactions
│   └── app.js        # Application initialization
└── README.md         # This documentation
```

## JavaScript Modules

### config.js

This module contains all global configuration settings and state variables. It defines:

- Initial map view state (longitude, latitude, zoom, etc.)
- Initial QR code position
- State variables for layer visibility, movement radius, and QR impact weight
- Manual control toggle state

### qrDetection.js

Handles all QR code detection and processing using OpenCV.js:

- Loads the OpenCV.js library asynchronously
- Initializes the webcam video capture
- Processes video frames to detect QR codes
- Calculates QR code position and updates the visualization
- Visualizes detected QR codes with an outline

### mapLayers.js

Manages the map and visualization layers:

- Loads tree data from the JSON file
- Creates and updates deck.gl layers (HexagonLayer, ScatterplotLayer)
- Handles tree data visualization with appropriate styling
- Creates the QR position indicator layer
- Initializes the MapLibre GL map and deck.gl overlay

### controls.js

Manages user interface controls and event listeners:

- Initializes all UI control elements
- Handles layer toggling between hexagon and scatter plot views
- Controls movement radius and QR impact weight sliders
- Manages manual control mode and movement buttons
- Updates tooltip information when hovering over tree points

### app.js

The application entry point that initializes all components:

- Loads and starts all required modules
- Ensures proper sequence of initialization
- Binds the application to DOM content loading

## Getting Started

1. Clone or download this repository
2. Ensure you have a webcam connected to your computer
3. Start a local server (see below)
4. Open the application in a modern browser
5. Allow webcam access when prompted
6. Hold up a QR code to control the visualization

# Running JavaScript with a Local Server

## Why Use a Local Server?

Modern browsers block certain requests when loading files directly (`file://`). A local server (`http://localhost`) ensures proper execution, enabling:

- **CORS compliance** (avoiding security restrictions).
- **ES Modules support** (`import/export`).
- **Fetching external data** via `fetch` or AJAX.
- **Simulating real web behavior** (cookies, routing, sessions).
- **Better development tools** (live reloading, debugging).

## How to Start a Local Server

- **Python:** `python -m http.server 8000`
- **Node.js:** `npx http-server`
- **VS Code:** Install **Live Server** and click "Go Live."


## How to Use

1. **QR Code Control**: Hold a QR code in front of your webcam to control the map position
2. **Layer Toggle**: Use the "Show Hexagon Layer" checkbox to switch between visualization modes
3. **Movement Radius**: Adjust how sensitive the QR code movement affects the map
4. **QR Impact**: Control how much influence the QR position has on the hexagon layer aggregation
5. **Manual Control**: Enable manual control and use direction buttons if preferred

## Requirements

- Modern browser with WebGL support
- Webcam for QR code detection
- QR code for interaction (any standard QR code will work)
- Local web server for running the application

## Credits

- Tree data sourced from open city data
- Built with deck.gl, MapLibre GL, and OpenCV.js
