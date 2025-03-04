/* Tutorial: Main Application
 * This is the entry point of the application.
 * It initializes all components and starts the application.
 */

async function initializeApplication() {
    initializeControls();
    // await initializeVideoAndCanvas();
    await initializeDeckGL();
}

// Start the application when the page loads
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded, initializing controls...");
    initializeApplication();
});
