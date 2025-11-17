/**
 * @fileoverview Provides functions to dynamically load and initialize Lucide icons
 */

const LUCIDE_CDN_URL = 'https://unpkg.com/lucide@latest/dist/umd/lucide.js';

/**
 * Creates Lucide icons if the library is already loaded
 * @returns {boolean} True if icons were created, false if library not loaded
 */
function createIconsIfLoaded() {
    if (window.lucide) {
        window.lucide.createIcons();
        return true;
    }
    return false;
}

/**
 * Dynamically loads the Lucide library from CDN and initializes icons
 * @returns {void}
 */
function loadLucideFromCDN() {
    const script = document.createElement('script');
    script.src = LUCIDE_CDN_URL;
    script.onload = createIconsIfLoaded;
    document.head.appendChild(script);
}

/**
 * Initializes Lucide icons, loading the library from CDN if needed
 * @returns {void}
 */
function initLucideIcons() {
    if (!createIconsIfLoaded()) {
        loadLucideFromCDN();
    }
}

document.addEventListener('DOMContentLoaded', initLucideIcons);
document.addEventListener('astro:page-load', initLucideIcons);
window.initLucideIcons = initLucideIcons;
