/**
 * @fileoverview Styling utilities for consistent component appearance
 */

/**
 * Generates CSS classes for button variants and sizes
 * @param {string} variant - The button variant ('primary', 'secondary', 'back')
 * @param {string} size - The button size ('sm', 'md', 'lg')
 * @returns {string} The CSS classes string
 */
export function getButtonClasses(variant, size) {
    const baseClasses = "inline-flex items-center gap-2 font-medium rounded-md transition-colors";

    const sizeClasses = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base"
    };

    const variantClasses = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        secondary: "border border-blue-600 text-blue-600 bg-white hover:bg-blue-600 hover:text-white",
        back: "border border-gray-300 text-blue-600 bg-white hover:bg-blue-600 hover:text-white hover:-translate-x-0.5"
    };

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`;
}

/**
 * Generates CSS classes for form input elements
 * @param {boolean} hasError - Whether the input has validation errors
 * @param {string} size - The input size ('sm', 'md', 'lg')
 * @returns {string} The CSS classes string
 */
export function getInputClasses(hasError = false, size = 'md') {
    const baseClasses = "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500";

    const sizeClasses = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-6 py-3 text-base"
    };

    const errorClasses = hasError
        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
        : "";

    return `${baseClasses} ${sizeClasses[size]} ${errorClasses}`;
}
