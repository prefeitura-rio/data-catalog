/* Catalog data loading and processing utilities */
import fs from 'fs';
import path from 'path';

/**
 * @typedef {Object} ColumnInfo
 * @property {string} type - Column data type (e.g., 'STRING', 'INTEGER', 'TIMESTAMP')
 * @property {string} [description] - Optional column description
 */

/**
 * @typedef {Object} Table
 * @property {string} name - Table name
 * @property {string} created_at - ISO timestamp when table was created
 * @property {Record<string, ColumnInfo>} schema - Table schema with column definitions
 */

/**
 * @typedef {Object} DatasetRaw
 * @property {string} description - Dataset description
 * @property {Table[]} tables - Array of tables in the dataset
 */

/**
 * @typedef {Object} Dataset
 * @property {string} name - Dataset name
 * @property {string} description - Dataset description
 * @property {number} tableCount - Number of tables in the dataset
 * @property {number} lastUpdated - Unix timestamp of most recent table update
 */

/**
 * @typedef {Object} DatasetFull
 * @property {string} name - Dataset name
 * @property {string} description - Dataset description
 * @property {Table[]} tables - Array of tables with full schema information
 */

/**
 * @typedef {Record<string, DatasetRaw>} CatalogData
 */

/**
 * Loads and parses the catalog.json file
 * @returns {CatalogData} Parsed catalog data with dataset definitions
 */
export function loadCatalogData() {
    const catalogPath = path.join(process.cwd(), 'catalog.json');
    const catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
    return JSON.parse(catalogData);
}

/**
 * Transforms raw catalog data into processed dataset objects
 * @returns {Dataset[]} Array of dataset objects with computed properties
 */
export function getDatasets() {
    const catalog = loadCatalogData();

    return Object.keys(catalog['rj-iplanrio']).map(datasetName => ({
        name: datasetName,
        description: catalog['rj-iplanrio'][datasetName].description,
        tableCount: catalog['rj-iplanrio'][datasetName].tables.length,
        lastUpdated: Math.max(...catalog['rj-iplanrio'][datasetName].tables.map(table =>
            new Date(table.created_at).getTime()
        ))
    }));
}

/**
 * Gets a specific dataset by name
 * @param {string} datasetName - Name of the dataset to retrieve
 * @returns {DatasetFull} Dataset object with name, description, and tables
 */
export function getDatasetByName(datasetName) {
    const catalog = loadCatalogData();

    return {
        name: datasetName,
        description: catalog['rj-iplanrio'][datasetName].description,
        tables: catalog['rj-iplanrio'][datasetName].tables
    };
}

/**
 * Gets all available dataset names for static path generation
 * @returns {string[]} Array of dataset names
 */
export function getDatasetNames() {
    const catalog = loadCatalogData();
    return Object.keys(catalog['rj-iplanrio']);
}
