# Sidewalk Width Simulator for Urban Planning

This project provides an interactive visualization tool for urban planners to analyze and simulate sidewalk widths in relation to pedestrian traffic. The application displays sidewalk data on a map using deck.gl, with the ability to adjust sidewalk widths and observe the impact on pedestrian density metrics.

## Features

-   Interactive map visualization with deck.gl and MapLibre GL
-   Adjustable Sidewalk data visualization with color-coded pedestrian density
-   Time-of-day selection to view different pedestrian traffic patterns
-   Hexagon aggregation view for density analysis
-   Selection of individual sidewalk segments for focused analysis

## Project Structure

```
sidewalk-width-simulator/
│
├── index.html        # Main HTML structure
├── styles.css        # CSS styles
├── sidewalks.json    # Sidewalk dataset
├── wv_bid.json       # West Village BID boundary
├── js/
│   ├── config.js     # Configuration settings
│   ├── mapLayers.js  # Map visualization layers
│   ├── controls.js   # UI controls and interactions
│   └── app.js        # Application initialization
└── README.md         # This documentation
```

### JavaScript Modules

#### config.js

This module contains all global configuration settings and state variables. It defines:

-   Initial map view state (longitude, latitude, zoom, etc.)
-   State variables for layer visibility and hexagon layer parameters
-   Default sidewalk width multiplier
-   Selected time of day

#### mapLayers.js

Manages the map and visualization layers:

-   Loads sidewalk data from JSON files
-   Creates and updates deck.gl layers (GeoJsonLayer, HexagonLayer)
-   Handles sidewalk data visualization with appropriate styling
-   Implements sidewalk width modification algorithms
-   Calculates pedestrian density metrics
-   Manages polygon selection and highlighting

#### controls.js

Manages user interface controls and event listeners:

-   Initializes all UI control elements
-   Handles layer toggling between standard and hexagon views
-   Controls hexagon radius and elevation scale sliders
-   Manages sidewalk width adjustment slider
-   Updates tooltip information when hovering over sidewalk segments
-   Handles time-of-day selection

#### app.js

The application entry point that initializes all components:

-   Loads and starts all required modules
-   Ensures proper sequence of initialization
-   Binds the application to DOM content loading

## Getting Started

1. Clone or download this repository
2. Start a local server (see below)
3. Open the application in a modern browser
4. Select a sidewalk segment by clicking on it
5. Use the width slider to adjust the sidewalk width
6. Observe changes in pedestrian density metrics

### How to Use

1. Time Selection: Use the "Time of Day" dropdown to switch between morning (9 AM), noon (12 PM), and evening (7 PM) pedestrian patterns
2. Layer Toggle: Use the "Show Hexagon Layer" checkbox to switch between visualization modes
3. Hexagon Controls: Adjust hexagon radius and elevation scale when in hexagon view
4. Sidewalk Selection: Click on any sidewalk segment to select it for width adjustment
5. Width Adjustment: Use the "Sidewalk Width Multiplier" slider to increase or decrease the selected sidewalk's width
6. Reset Width: Click the "Reset Width" button to return to the original width

## Data Processing

The sidewalk data used in this application was processed using Python with GeoPandas. The processing workflow includes:

1. Loading Business Improvement District (BID) boundaries
2. Extracting sidewalk data within the West Village BID
3. Calculating sidewalk dimensions (width, length, area)
4. Estimating pedestrian traffic at different times of day
5. Computing area per person metrics
6. Deduplicating overlapping sidewalk segments
7. Exporting processed data to GeoJSON format

For more details on the data processing methodology, see the included Jupyter notebook (wv_bid_kpfui_dev.ipynb).
