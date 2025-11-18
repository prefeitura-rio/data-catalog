/**
 * @fileoverview Astro component helper utilities
 */

/**
 * Filters out Astro-specific props to create clean data attributes object
 * @param {Record<string, any>} attributes - The attributes object to filter
 * @param {string[]} astroProps - Array of prop names to filter out
 * @returns {Record<string, any>} Filtered attributes object
 */
export function getDataAttributes(attributes, astroProps = []) {
    return Object.fromEntries(
        Object.entries(attributes).filter(([key]) => !astroProps.includes(key))
    );
}

/**
 * Filters out button-specific Astro props
 * @param {Record<string, any>} attributes - The attributes object to filter
 * @returns {Record<string, any>} Filtered attributes object
 */
export function getButtonDataAttributes(attributes) {
    const astroProps = [
        'variant', 'size', 'href', 'icon', 'iconPosition',
        'className', 'type', 'disabled', 'target', 'rel'
    ];
    return getDataAttributes(attributes, astroProps);
}

/**
 * Merges CSS class names, filtering out undefined and empty strings
 * @param {...string} classes - CSS class strings to merge
 * @returns {string} The merged class string
 */
export function mergeClasses(...classes) {
    return classes
        .filter(Boolean)
        .join(' ')
        .trim();
}

/**
 * Converts a string to a URL-safe slug
 * @param {string} text - The text to convert to a slug
 * @returns {string} The URL-safe slug
 */
export function slugify(text) {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}
