/* Table and dataset rendering utilities */
import { formatSchema } from './schema.js';

/**
 * @typedef {import('./catalog.js').Table} Table
 * @typedef {import('./schema.js').FormattedColumn} FormattedColumn
 */

/**
 * @typedef {Object} TableRenderData
 * @property {string} name - Table name
 * @property {string} formattedDate - Formatted creation date
 * @property {number} columnCount - Number of columns in the table
 * @property {FormattedColumn[]} schemaEntries - Formatted schema entries
 */

/**
 * Prepares table data for rendering in Astro components
 * @param {Table} table - Table object with name, created_at, and schema properties
 * @returns {TableRenderData} Processed table data ready for rendering
 */
export function prepareTableForRender(table) {
    const schemaEntries = formatSchema(table.schema);

    return {
        name: table.name,
        formattedDate: new Date(table.created_at).toLocaleString('pt-BR'),
        columnCount: schemaEntries.length,
        schemaEntries: schemaEntries
    };
}

/**
 * Prepares all tables in a dataset for rendering
 * @param {Table[]} tables - Array of table objects to process
 * @returns {TableRenderData[]} Array of processed table data ready for rendering
 */
export function prepareDatasetTablesForRender(tables) {
    return tables.map((table /** @type {Table} */) => prepareTableForRender(table));
}
