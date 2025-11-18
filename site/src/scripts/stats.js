import { getDatasets, getTotalTableCount } from './catalog.js';
import { getTotalColumns } from './schema.js';

/**
 * @typedef {import('./catalog.js').Dataset} Dataset
 * @typedef {import('./catalog.js').Table} Table
 */

/**
 * @typedef {Object} StatItem
 * @property {number} value - Numeric value to display
 * @property {string} label - Label text for the statistic
 * @property {string} [className] - Optional CSS class for custom styling
 */

/**
 * Generates statistics for the home page
 * @returns {StatItem[]} Array of statistics for home page display
 */
export function getHomePageStats() {
    const datasets = getDatasets();
    return [
        {
            value: datasets.length,
            label: 'Conjuntos de Dados'
        },
        {
            value: getTotalTableCount(datasets),
            label: 'Tabelas'
        }
    ];
}

/**
 * Generates statistics for the datasets listing page
 * @returns {StatItem[]} Array of statistics for datasets page display
 */
export function getDatasetsPageStats() {
    const datasets = getDatasets();
    return [
        {
            value: datasets.length,
            label: 'Datasets'
        },
        {
            value: getTotalTableCount(datasets),
            label: 'Total de Tabelas'
        }
    ];
}

/**
 * Generates statistics for individual dataset pages
 * @param {Table[]} tables - Array of tables from the dataset
 * @returns {StatItem[]} Array of statistics for dataset detail page
 */
export function getDatasetPageStats(tables) {
    return [
        {
            value: tables.length,
            label: `Tabela${tables.length !== 1 ? 's' : ''}`
        },
        {
            value: getTotalColumns(tables),
            label: 'Colunas Totais'
        }
    ];
}
