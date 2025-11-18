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
 * @property {string} project - Project key this dataset belongs to
 * @property {string} description - Dataset description
 * @property {number} tableCount - Number of tables in the dataset
 * @property {number} lastUpdated - Unix timestamp of most recent table update
 */

/**
 * @typedef {Object} DatasetFull
 * @property {string} name - Dataset name
 * @property {string} project - Project key this dataset belongs to
 * @property {string} description - Dataset description
 * @property {Table[]} tables - Array of tables with full schema information
 */

/**
 * @typedef {Record<string, DatasetRaw>} CatalogData
 */

/**
 * Gets all available project keys from catalog data
 * @returns {string[]} Array of project keys (e.g., ['rj-iplanrio', 'sp-sabesp'])
 */
export function getProjectKeys() {
    const catalog = loadCatalogData();
    return Object.keys(catalog);
}

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
 * Gets datasets from all projects
 * @returns {Dataset[]} Array of dataset objects with computed properties from all projects
 */
export function getDatasets() {
    const catalog = loadCatalogData();
    const projectKeys = getProjectKeys();

    const allDatasets = [];
    projectKeys.forEach(projectKey => {
        Object.keys(catalog[projectKey]).forEach(datasetName => {
            allDatasets.push({
                name: datasetName,
                project: projectKey,
                description: catalog[projectKey][datasetName].description,
                tableCount: catalog[projectKey][datasetName].tables.length,
                lastUpdated: Math.max(...catalog[projectKey][datasetName].tables.map(table =>
                    new Date(table.created_at).getTime()
                ))
            });
        });
    });

    return allDatasets;
}

/**
 * Gets a specific dataset by name, searching across all projects
 * @param {string} datasetName - Name of the dataset to retrieve
 * @returns {DatasetFull} Dataset object with name, description, and tables
 */
export function getDatasetByName(datasetName) {
    const catalog = loadCatalogData();
    const projectKeys = getProjectKeys();

    for (const projectKey of projectKeys) {
        if (catalog[projectKey][datasetName]) {
            return {
                name: datasetName,
                project: projectKey,
                description: catalog[projectKey][datasetName].description,
                tables: catalog[projectKey][datasetName].tables
            };
        }
    }

    throw new Error(`Dataset "${datasetName}" not found in any project`);
}

/**
 * Gets all available dataset names for static path generation
 * @returns {string[]} Array of dataset names from all projects
 */
export function getDatasetNames() {
    const catalog = loadCatalogData();
    const projectKeys = getProjectKeys();
    const allNames = new Set();

    projectKeys.forEach(projectKey => {
        Object.keys(catalog[projectKey]).forEach(datasetName => {
            allNames.add(datasetName);
        });
    });

    return Array.from(allNames);
}

/**
 * Calculates the total number of tables across all datasets
 * @param {Dataset[]} datasets - Array of dataset objects
 * @returns {number} Total table count
 */
export function getTotalTableCount(datasets) {
    return datasets.reduce((sum, dataset) => sum + dataset.tableCount, 0);
}

/**
 * Gets datasets sorted alphabetically by name
 * @returns {Dataset[]} Sorted array of dataset objects
 */
export function getDatasetsSorted() {
    return getDatasets().sort((a, b) => a.name.localeCompare(b.name));
}
