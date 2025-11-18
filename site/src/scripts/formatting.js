/**
 * @fileoverview Formatting utilities for consistent data display
 */

/**
 * Formats a number using Brazilian Portuguese locale
 * @param {number} value - The number to format
 * @returns {string} The formatted number string
 */
export function formatStatValue(value) {
    return value.toLocaleString('pt-BR');
}

/**
 * Formats a date using Brazilian Portuguese locale
 * @param {Date|string} date - The date to format
 * @returns {string} The formatted date string
 */
export function formatDate(date) {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('pt-BR');
}

/**
 * Formats a file size in bytes to human readable format
 * @param {number} bytes - The size in bytes
 * @returns {string} The formatted size string
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
