/**
 * @fileoverview Navigation utilities for route handling and active state management
 */

/**
 * Determines if a navigation link is currently active based on the current path
 * @param {string} linkPath - The path of the navigation link
 * @param {string} currentPath - The current page path
 * @returns {boolean} True if the link should be marked as active
 */
export function isLinkActive(linkPath, currentPath) {
    if (linkPath === '/' && currentPath === '/') return true;
    if (linkPath !== '/' && currentPath.startsWith(linkPath)) return true;
    return false;
}

/**
 * Generates CSS classes for navigation links based on active state and device type
 * @param {boolean} isActive - Whether the link is currently active
 * @param {boolean} isMobile - Whether this is for mobile navigation
 * @returns {string} The CSS classes string
 */
export function getNavLinkClasses(isActive, isMobile) {
    const baseClasses = isMobile
        ? "flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors"
        : "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors";

    const stateClasses = isActive
        ? "text-blue-600 bg-blue-50"
        : "text-gray-600 hover:text-blue-600 hover:bg-gray-50";

    return `${baseClasses} ${stateClasses}`;
}

/**
 * Determines if the datasets section should be marked as active
 * @param {string} currentPath - The current page path
 * @returns {boolean} True if datasets should be active
 */
export function shouldDatasetsBeActive(currentPath) {
    return currentPath.startsWith('/datasets/') ||
        (currentPath !== '/' && currentPath !== '/datasets/' && currentPath !== '/datasets');
}
