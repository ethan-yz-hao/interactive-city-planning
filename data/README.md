# NYC Trees Analysis in Long Island City Tutorial

This tutorial demonstrates how to analyze tree data within the Long Island City Business Improvement District (BID) using Python, GeoPandas, and spatial analysis techniques.

## Overview

We'll analyze the distribution of trees within the Long Island City BID area using two primary datasets:
- NYC Street Trees dataset
- Business Improvement Districts (BIDs) boundaries

## Step-by-Step Analysis

### 1. Setup and Data Loading
First, we install and import required libraries:
- GeoPandas for geographic data operations
- Matplotlib for visualization

We then load two datasets:
- `Forestry_Tree_Points.csv`: Contains NYC tree locations
- `NYC_BIDS_09112015.csv`: Contains BID boundaries

### 2. Data Preprocessing
The notebook performs several key preprocessing steps:
- Converts string-based location data to geometric format
- Filters BID data to focus on Long Island City Partnership
- Explodes complex geometries into simpler components for better analysis

### 3. Spatial Analysis
We perform spatial analysis by:
- Creating a bounding box around the LIC BID area
- Filtering trees to only those within this bounding box
- Visualizing the distribution of trees by species

### 4. Visualization
The notebook creates several visualizations:
- Side-by-side comparison of original and exploded BID geometries
- Combined map showing trees overlaid on the BID boundary
- Trees colored by species type

### 5. Data Export
Finally, we export the processed tree data to a GeoJSON file for further use.

## Key Concepts

- Geometric data manipulation using GeoPandas
- Spatial filtering using bounding boxes
- Geographic visualization techniques
- Working with complex polygon geometries

## Usage

To run this analysis:
1. Ensure you have the required datasets in the same directory
2. Install required Python packages
3. Run the notebook cells in sequence
