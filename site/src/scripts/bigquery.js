/* BigQuery integration utilities for copying SQL queries */

/**
 * Copies a BigQuery SQL query to the clipboard and provides user feedback
 * @param {string} projectKey - The BigQuery project ID (e.g., 'rj-iplanrio')
 * @param {string} datasetName - The BigQuery dataset name
 * @param {string} tableName - The BigQuery table name
 * @param {string[]} columnNames - Array of column names to include in the SELECT statement
 * @param {HTMLElement} button - The button element that was clicked
 */
function copyQuery(projectKey, datasetName, tableName, columnNames, button) {
    const columns = columnNames.join(',\n  ');
    const query = `SELECT
  ${columns}
FROM \`${projectKey}.${datasetName}.${tableName}\`
LIMIT 100`;

    navigator.clipboard.writeText(query).then(() => {
        const originalText = button.innerHTML;

        button.innerHTML = `
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<polyline points="20,6 9,17 4,12"></polyline>
			</svg>
			Copiado!
		`;

        setTimeout(() => {
            button.innerHTML = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Erro ao copiar query:', err);
        alert('Erro ao copiar query para clipboard');
    });
}

/**
 * Initialize event listeners for BigQuery copy buttons
 * Uses event delegation to handle dynamically generated buttons
 */
function initBigQueryHandlers() {
    document.addEventListener('click', function(event) {
        if (event.target.closest('[data-copy-query]')) {
            const button = event.target.closest('[data-copy-query]');
            const projectKey = button.dataset.project;
            const datasetName = button.dataset.dataset;
            const tableName = button.dataset.table;
            const columnNames = JSON.parse(button.dataset.columns);

            copyQuery(projectKey, datasetName, tableName, columnNames, button);
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBigQueryHandlers);
} else {
    initBigQueryHandlers();
}
