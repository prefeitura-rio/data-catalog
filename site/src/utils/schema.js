/* Schema formatting and processing utilities */
import { getDatasetByName, getDatasetNames } from './catalog.js';

/**
 * @typedef {import('./catalog.js').ColumnInfo} ColumnInfo
 * @typedef {import('./catalog.js').Table} Table
 * @typedef {import('./catalog.js').DatasetFull} DatasetFull
 */

/**
 * @typedef {Object} FormattedColumn
 * @property {string} name - Column name
 * @property {string} type - Column data type
 * @property {string} description - Column description (defaults to 'Sem descrição')
 */

/**
 * @typedef {Object} StaticPathParams
 * @property {string} dataset - Dataset name parameter
 */

/**
 * @typedef {Object} StaticPathProps
 * @property {DatasetFull} dataset - Full dataset object with tables
 */

/**
 * @typedef {Object} StaticPath
 * @property {StaticPathParams} params - Route parameters
 * @property {StaticPathProps} props - Component props
 */

/**
 * Formats a schema object into a display-friendly array
 * @param {Record<string, ColumnInfo>} schema - Raw schema object with column definitions
 * @returns {FormattedColumn[]} Array of formatted column objects
 */
export function formatSchema(schema) {
    return Object.entries(schema).map(([columnName, columnInfo]) => ({
        name: columnName,
        type: columnInfo.type,
        description: columnInfo.description || 'Sem descrição'
    }));
}

/**
 * Generates static paths for all datasets (used in Astro dynamic routes)
 * @returns {Promise<StaticPath[]>} Array of path objects for Astro getStaticPaths
 */
export async function getStaticPaths() {
    const datasets = getDatasetNames();

    return datasets.map((datasetName) => ({
        params: { dataset: datasetName },
        props: {
            dataset: getDatasetByName(datasetName)
        }
    }));
}

/**
 * Calculates total columns across all tables in a dataset
 * @param {Table[]} tables - Array of table objects with schema property
 * @returns {number} Total number of columns
 */
export function getTotalColumns(tables) {
    return tables.reduce((sum, table) => sum + Object.keys(table.schema).length, 0);
}
