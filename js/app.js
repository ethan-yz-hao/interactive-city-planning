/* Tutorial: Main Application
 * This is the entry point of the application.
 * It initializes all components and starts the application.
 */

async function initializeApplication() {
  await initializeVideoAndCanvas();
  await initializeDeckGL();
  initializeControls();
}

// Start the application when the page loads
document.addEventListener("DOMContentLoaded", initializeApplication);
