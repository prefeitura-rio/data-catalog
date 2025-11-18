/**
 * @fileoverview Simplified BigQuery SQL query generator with Shiki highlighting
 */

import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

const CONFIG = {
    messages: {
        copy: 'Copiar',
        copied: 'Copiado!',
        copyError: 'Erro ao copiar query'
    },
    timing: {
        copyFeedbackDuration: 2000
    },
    icons: {
        copy: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
        check: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="m9 12 2 2 4-4"/></svg>'
    }
};

const highlighterPromise = createHighlighterCore({
    themes: [import('@shikijs/themes/github-dark')],
    langs: [
        import('@shikijs/langs/sql'),
        import('@shikijs/langs/python')
    ],
    engine: createJavaScriptRegexEngine()
});

/**
 * Highlights SQL code using Shiki syntax highlighter
 * @param {string} sqlCode - The SQL code to highlight
 * @returns {Promise<string>} The highlighted HTML code
 */
async function highlightCode(code, lang) {
    try {
        const highlighter = await highlighterPromise;
        return highlighter.codeToHtml(code, {
            lang,
            theme: 'github-dark',
            transformers: [{
                pre(node) {
                    node.properties.style = 'background-color: transparent; padding: 1rem; margin: 0;';
                }
            }]
        });
    } catch (error) {
        console.warn('Syntax highlighting failed:', error);
        return `<pre style="background-color: transparent; color: #e5e7eb; padding: 1rem; margin: 0; font-family: 'Courier New', monospace;"><code>${code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
    }
}

/**
 * Generates BigQuery SQL from table metadata
 * @param {string} projectKey - The GCP project identifier
 * @param {string} datasetName - The BigQuery dataset name
 * @param {string} tableName - The BigQuery table name
 * @param {string[]|null} columnNames - Array of column names to select, or null for SELECT *
 * @returns {string} The generated SQL query string
 */
function generateQuery(projectKey, datasetName, tableName, columnNames) {
    if (!columnNames || columnNames.length === 0) {
        return `SELECT\n  *\nFROM \`${projectKey}.${datasetName}.${tableName}\`\nLIMIT 100`;
    }

    const filteredColumns = columnNames.filter(columnName => {
        if (columnName.includes('.')) {
            const parentColumnName = columnName.split('.')[0];
            return !columnNames.includes(parentColumnName);
        }
        return true;
    });

    const formattedColumns = filteredColumns.join(',\n  ');
    return `SELECT\n  ${formattedColumns}\nFROM \`${projectKey}.${datasetName}.${tableName}\`\nLIMIT 100`;
}

/**
 * Copies text to clipboard with visual feedback
 * @param {string} text - The text to copy to clipboard
 * @param {HTMLButtonElement} button - The button element to show feedback on
 * @returns {Promise<void>}
 */
async function copyToClipboard(text, button) {
    try {
        await navigator.clipboard.writeText(text);
        const originalHTML = button.innerHTML;
        button.innerHTML = `${CONFIG.icons.check} ${CONFIG.messages.copied}`;
        setTimeout(() => {
            button.innerHTML = originalHTML;
        }, CONFIG.timing.copyFeedbackDuration);
    } catch (error) {
        console.error('Copy error:', error);
        alert(CONFIG.messages.copyError);
    }
}

/**
 * Shows query preview window with highlighted SQL
 * @param {string} sqlQuery - The SQL query to display
 * @param {HTMLButtonElement} triggerButton - The button that triggered the preview
 * @returns {Promise<void>}
 */
async function showCodePreview({ code, lang, title, triggerButton }) {
    const container = triggerButton.parentNode.parentNode;
    const existingWindow = container.querySelector('.code-preview');
    if (existingWindow) existingWindow.remove();

    const previewWindow = document.createElement('div');
    previewWindow.className = 'code-preview bg-gray-900 rounded-lg p-4 mt-4 border border-gray-700';

    const header = document.createElement('div');
    header.className = 'flex items-center justify-between mb-2';

    const titleEl = document.createElement('span');
    titleEl.className = 'text-gray-300 text-sm font-medium';
    titleEl.textContent = title;

    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'flex items-center gap-2';

    const copyButton = document.createElement('button');
    copyButton.className = 'bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded flex items-center gap-1';
    copyButton.innerHTML = `${CONFIG.icons.copy} ${CONFIG.messages.copy}`;
    copyButton.onclick = () => copyToClipboard(code, copyButton);

    const closeButton = document.createElement('button');
    closeButton.className = 'text-gray-400 hover:text-gray-200 text-lg px-2 py-1 hover:bg-gray-800 rounded';
    closeButton.innerHTML = '×';
    closeButton.onclick = () => previewWindow.remove();

    const codeContainer = document.createElement('div');
    codeContainer.className = 'bg-gray-900 rounded overflow-x-auto border border-gray-700';
    codeContainer.innerHTML = `<pre style="background-color: transparent; color: #e5e7eb; padding: 1rem; margin: 0;"><code>${code}</code></pre>`;

    highlightCode(code, lang).then(highlightedHTML => {
        codeContainer.innerHTML = highlightedHTML;
    });

    buttonGroup.appendChild(copyButton);
    buttonGroup.appendChild(closeButton);
    header.appendChild(titleEl);
    header.appendChild(buttonGroup);
    previewWindow.appendChild(header);
    previewWindow.appendChild(codeContainer);

    container.insertBefore(previewWindow, triggerButton.parentNode.nextSibling);
}

/**
 * Gets selected column names for a table
 * @param {string} tableName - The table name to get selected columns for
 * @returns {string[]} Array of selected column names
 */
function getSelectedColumns(tableName) {
    const checkboxes = document.querySelectorAll(`.column-checkbox[data-table="${tableName}"]:checked`);
    return Array.from(checkboxes).map(checkbox => checkbox.dataset.column);
}

/**
 * Handles query generation button clicks
 * @param {HTMLButtonElement} button - The button element that was clicked
 * @returns {Promise<void>}
 */
async function handleQueryGeneration(button) {
    const tableName = button.dataset.table;
    const selectedColumns = getSelectedColumns(tableName);

    const query = generateQuery(
        button.dataset.project,
        button.dataset.dataset,
        tableName,
        selectedColumns
    );

    await showCodePreview({
        code: query,
        lang: 'sql',
        title: 'Query Gerada',
        triggerButton: button
    });
}

/**
 * Generates Python snippet for BigQuery API using the same SQL
 * @param {string} projectKey
 * @param {string} datasetName
 * @param {string} tableName
 * @param {string[]} selectedColumns
 * @returns {string}
 */
function generatePythonRequest(projectKey, datasetName, tableName, selectedColumns) {
    const query = generateQuery(projectKey, datasetName, tableName, selectedColumns);
    const parametrizedQuery = query.replace(/LIMIT\s+\d+/i, 'LIMIT @limit');
    const indentedQuery = parametrizedQuery.split('\n').map(line => `    ${line}`).join('\n');

    return `from google.cloud import bigquery
from google.api_core.exceptions import GoogleAPIError
from google.auth.exceptions import DefaultCredentialsError

# -----------------------------------------------------
# Autenticação:
# Antes de rodar o script execute:
# gcloud auth application-default login
# -----------------------------------------------------

PROJECT_ID = "${projectKey}"
TABLE_ID = "${projectKey}.${datasetName}.${tableName}"

client = bigquery.Client(project=PROJECT_ID)

def run_query(limit=100):
    try:
        query = \"\"\"
${indentedQuery}
        \"\"\"

        job_config = bigquery.QueryJobConfig(
            query_parameters=[
                bigquery.ScalarQueryParameter("limit", "INT64", limit),
            ],
            use_query_cache=True,
            dry_run=False,
        )

        job = client.query(query, job_config=job_config)
        results = job.result(timeout=60)

        return [dict(row) for row in results]

    except (GoogleAPIError, DefaultCredentialsError) as exc:
        raise RuntimeError(f"Erro ao executar query: {exc}") from exc


if __name__ == "__main__":
    for row in run_query(limit=100):
        print(row)
`;
}

/**
 * Handles Python request button clicks
 * @param {HTMLButtonElement} button
 * @returns {Promise<void>}
 */
async function handlePythonRequest(button) {
    const tableName = button.dataset.table;
    const selectedColumns = getSelectedColumns(tableName);

    const pythonCode = generatePythonRequest(
        button.dataset.project,
        button.dataset.dataset,
        tableName,
        selectedColumns
    );

    await showCodePreview({
        code: pythonCode,
        lang: 'python',
        title: 'Exemplo Python (BigQuery API)',
        triggerButton: button
    });
}

/**
 * Updates checkbox visual state based on checked status
 * @param {HTMLInputElement} checkbox - The checkbox element to update visuals for
 * @returns {void}
 */
function updateCheckboxVisuals(checkbox) {
    const row = checkbox.closest('tr');
    if (!row) return;

    if (checkbox.checked) {
        row.classList.add('bg-blue-50', 'hover:bg-blue-100');
        row.classList.remove('hover:bg-gray-50');
    } else {
        row.classList.remove('bg-blue-50', 'hover:bg-blue-100');
        row.classList.add('hover:bg-gray-50');
    }
}

/**
 * Handles select all functionality for table columns
 * @param {HTMLInputElement} selectAllCheckbox - The "select all" checkbox element
 * @returns {void}
 */
function handleSelectAll(selectAllCheckbox) {
    const tableName = selectAllCheckbox.dataset.table;
    const columnCheckboxes = document.querySelectorAll(`.column-checkbox[data-table="${tableName}"]`);

    columnCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
        updateCheckboxVisuals(checkbox);
    });
}

/**
 * Updates select all checkbox state based on individual column selections
 * @param {string} tableName - The table name to update select all state for
 * @returns {void}
 */
function updateSelectAllState(tableName) {
    const selectAllCheckbox = document.querySelector(`.table-select-all-checkbox[data-table="${tableName}"]`);
    const columnCheckboxes = document.querySelectorAll(`.column-checkbox[data-table="${tableName}"]`);
    const checkedBoxes = document.querySelectorAll(`.column-checkbox[data-table="${tableName}"]:checked`);

    if (!selectAllCheckbox) return;

    if (checkedBoxes.length === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
    } else if (checkedBoxes.length === columnCheckboxes.length) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
    } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
    }
}

/**
 * Initializes BigQuery functionality by setting up event listeners
 * @returns {void}
 */
function init() {
    document.addEventListener('click', (event) => {
        const pythonButton = event.target.closest('[data-python-request]');
        if (pythonButton) {
            handlePythonRequest(pythonButton);
            return;
        }

        const queryButton = event.target.closest('[data-copy-query]');
        if (queryButton) {
            handleQueryGeneration(queryButton);
        }
    });

    document.addEventListener('change', (event) => {
        const selectAllCheckbox = event.target.closest('.table-select-all-checkbox');
        if (selectAllCheckbox) {
            handleSelectAll(selectAllCheckbox);
            return;
        }

        const columnCheckbox = event.target.closest('.column-checkbox');
        if (columnCheckbox) {
            updateCheckboxVisuals(columnCheckbox);
            updateSelectAllState(columnCheckbox.dataset.table);
        }
    });

    document.querySelectorAll('.table-select-all-checkbox').forEach(checkbox => {
        updateSelectAllState(checkbox.dataset.table);
    });

    document.querySelectorAll('.column-checkbox').forEach(checkbox => {
        updateCheckboxVisuals(checkbox);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
