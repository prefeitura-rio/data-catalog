/**
 * @fileoverview Optimized BigQuery SQL query generator with high-performance Shiki highlighting
 * Uses fine-grained imports and JavaScript regex engine for minimal bundle size
 */

import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

const CONFIG = {
    selectors: {
        queryButton: '[data-copy-query]',
        queryPreview: '.query-preview',
        codeContainer: '.query-code-container',
        copyButton: '.copy-query-button',
        closeButton: '.query-preview-close'
    },
    cssClasses: {
        previewWindow: 'query-preview',
        previewContent: 'bg-gray-900 rounded-lg p-4 mt-3 border border-gray-700',
        header: 'flex items-center justify-between mb-2',
        title: 'text-gray-300 text-sm font-medium',
        buttonGroup: 'flex items-center gap-2',
        copyButton: 'copy-query-button bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded flex items-center gap-1 cursor-copy',
        closeButton: 'query-preview-close text-gray-400 hover:text-gray-200 text-lg px-2 py-1 hover:bg-gray-800 rounded',
        codeContainer: 'query-code-container bg-gray-900 rounded overflow-x-auto border border-gray-700'
    },
    icons: {
        copy: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
             <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
           </svg>`,
        check: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>`,
        close: '&times;'
    },
    messages: {
        title: 'Query Generated:',
        copy: 'Copiar',
        copied: 'Copiado!',
        copyError: 'Erro ao copiar query para clipboard',
        highlightingFailed: 'Shiki highlighting failed, falling back to plain text:'
    },
    styling: {
        codeStyle: 'background-color: transparent; padding: 1rem; margin: 0;',
        fallbackStyle: 'background-color: transparent; color: #e5e7eb; padding: 1rem; margin: 0; font-family: \'Courier New\', monospace;'
    },
    timing: {
        copyFeedbackDuration: 2000
    }
};


/**
 * Cached highlighter promise for performance optimization
 * Uses fine-grained imports and JavaScript engine for better performance
 */
const highlighterPromise = createHighlighterCore({
    themes: [
        import('@shikijs/themes/github-dark')
    ],
    langs: [
        import('@shikijs/langs/sql')
    ],
    engine: createJavaScriptRegexEngine()
});

/**
 * Gets the cached Shiki highlighter instance
 * Uses singleton pattern with lazy loading for optimal performance
 * @returns {Promise<Object>} The Shiki highlighter instance
 */
async function getHighlighter() {
    return await highlighterPromise;
}


/**
 * Highlights SQL code using Shiki with fallback to plain text
 * @param {string} sqlCode - The SQL code to highlight
 * @returns {Promise<string>} The highlighted HTML
 */
async function highlightSQL(sqlCode) {
    try {
        const highlighter = await getHighlighter();
        return highlighter.codeToHtml(sqlCode, {
            lang: 'sql',
            theme: 'github-dark',
            transformers: [
                {
                    pre(node) {
                        node.properties.style = CONFIG.styling.codeStyle;
                    }
                }
            ]
        });
    } catch (error) {
        console.warn(CONFIG.messages.highlightingFailed, error);
        return createPlainTextHTML(sqlCode);
    }
}


/**
 * Filters out nested columns when parent columns exist
 * @param {string[]} columnNames - Array of column names
 * @returns {string[]} Filtered column names
 */
function filterNestedColumns(columnNames) {
    return columnNames.filter(columnName => {
        if (columnName.includes('.')) {
            const parentColumnName = columnName.split('.')[0];
            return !columnNames.includes(parentColumnName);
        }
        return true;
    });
}


/**
 * Generates a BigQuery SELECT statement from table metadata
 * @param {string} projectKey - The GCP project key
 * @param {string} datasetName - The dataset name
 * @param {string} tableName - The table name
 * @param {string[]} columnNames - Array of column names
 * @returns {string} The formatted SQL query
 */
function generateQuery(projectKey, datasetName, tableName, columnNames) {
    const filteredColumns = filterNestedColumns(columnNames);
    const formattedColumns = filteredColumns.join(',\n  ');

    return `SELECT
  ${formattedColumns}
FROM \`${projectKey}.${datasetName}.${tableName}\`
LIMIT 100`;
}


/**
 * Shows successful copy feedback on button
 * @param {HTMLElement} button - Button to update
 */
function showCopySuccess(button) {
    const originalHTML = button.innerHTML;

    button.innerHTML = `${CONFIG.icons.check} ${CONFIG.messages.copied}`;

    setTimeout(() => {
        button.innerHTML = originalHTML;
    }, CONFIG.timing.copyFeedbackDuration);
}


/**
 * Copies text to clipboard and provides visual feedback
 * @param {string} text - Text to copy
 * @param {HTMLElement} button - Button element to update with feedback
 */
async function copyToClipboard(text, button) {
    try {
        await navigator.clipboard.writeText(text);
        showCopySuccess(button);
    } catch (error) {
        console.error('Copy error:', error);
        alert(CONFIG.messages.copyError);
    }
}


/**
 * Enhances code container with syntax highlighting
 * @param {HTMLElement} container - Container element
 * @param {string} code - Code to highlight
 */
async function enhanceWithSyntaxHighlighting(container, code) {
    try {
        const highlightedHTML = await highlightSQL(code);
        container.innerHTML = highlightedHTML;
    } catch (error) {
        console.warn('Failed to enhance with syntax highlighting:', error);
    }
}


/**
 * Creates a button with icon and text
 * @param {string} className - CSS classes for the button
 * @param {string} icon - SVG icon HTML
 * @param {string} text - Button text
 * @param {Function} onClick - Click handler function
 * @returns {HTMLElement} The created button element
 */
function createIconButton(className, icon, text, onClick) {
    const button = document.createElement('button');
    button.className = className;
    button.innerHTML = `${icon} ${text}`;
    if (onClick) {
        button.onclick = onClick;
    }
    return button;
}


/**
 * Creates a code preview container with syntax highlighting
 * @param {string} code - Code to display
 * @returns {HTMLElement} The code container element
 */
function createCodePreview(code) {
    const container = document.createElement('div');
    container.className = CONFIG.cssClasses.codeContainer;
    container.innerHTML = createPlainTextHTML(code);


    enhanceWithSyntaxHighlighting(container, code);

    return container;
}


/**
 * Finds existing preview window in the DOM
 * @param {HTMLElement} buttonContainer - Container to search in
 * @returns {HTMLElement|null} Existing window or null
 */
function findExistingWindow(buttonContainer) {
    return buttonContainer.parentNode.querySelector(CONFIG.selectors.queryPreview);
}


/**
 * Updates existing preview window with new query
 * @param {HTMLElement} existingWindow - Existing window element
 * @param {string} sqlQuery - New SQL query
 * @returns {HTMLElement} Updated window element
 */
function updateExistingWindow(existingWindow, sqlQuery) {
    const codeContainer = existingWindow.querySelector(CONFIG.selectors.codeContainer);
    const copyButton = existingWindow.querySelector(CONFIG.selectors.copyButton);

    codeContainer.innerHTML = createPlainTextHTML(sqlQuery);
    copyButton.onclick = () => copyToClipboard(sqlQuery, copyButton);

    enhanceWithSyntaxHighlighting(codeContainer, sqlQuery);

    return existingWindow;
}


/**
 * Creates the basic window structure
 * @returns {Object} Object containing window and content elements
 */
function createWindowStructure() {
    const previewWindow = document.createElement('div');
    previewWindow.className = CONFIG.cssClasses.previewWindow;

    const previewContent = document.createElement('div');
    previewContent.className = CONFIG.cssClasses.previewContent;

    const headerSection = document.createElement('div');
    headerSection.className = CONFIG.cssClasses.header;

    const titleLabel = document.createElement('span');
    titleLabel.className = CONFIG.cssClasses.title;
    titleLabel.textContent = CONFIG.messages.title;

    const buttonGroup = document.createElement('div');
    buttonGroup.className = CONFIG.cssClasses.buttonGroup;

    return {
        previewWindow,
        previewContent,
        headerSection,
        titleLabel,
        buttonGroup
    };
}


/**
 * Creates window components (buttons and code container)
 * @param {string} sqlQuery - SQL query for the code container
 * @returns {Object} Object containing created components
 */
function createWindowComponents(sqlQuery) {
    const copyButton = createIconButton(
        CONFIG.cssClasses.copyButton,
        CONFIG.icons.copy,
        CONFIG.messages.copy,
        null
    );

    const closeButton = createIconButton(
        CONFIG.cssClasses.closeButton,
        CONFIG.icons.close,
        '',
        null
    );

    const codeContainer = createCodePreview(sqlQuery);

    return { copyButton, closeButton, codeContainer };
}


/**
 * Assembles the window components into the complete structure
 * @param {Object} structure - Window structure components
 * @param {HTMLElement} copyButton - Copy button element
 * @param {HTMLElement} closeButton - Close button element
 * @param {HTMLElement} codeContainer - Code container element
 */
function assembleWindow(structure, copyButton, closeButton, codeContainer) {
    const { previewWindow, previewContent, headerSection, titleLabel, buttonGroup } = structure;

    buttonGroup.appendChild(copyButton);
    buttonGroup.appendChild(closeButton);
    headerSection.appendChild(titleLabel);
    headerSection.appendChild(buttonGroup);
    previewContent.appendChild(headerSection);
    previewContent.appendChild(codeContainer);
    previewWindow.appendChild(previewContent);
}


/**
 * Inserts window into DOM
 * @param {HTMLElement} window - Window element to insert
 * @param {HTMLElement} buttonContainer - Reference container for insertion
 */
function insertIntoDOM(window, buttonContainer) {
    buttonContainer.parentNode.insertBefore(window, buttonContainer.nextSibling);
}


/**
 * Attaches event listeners to window components
 * @param {HTMLElement} closeButton - Close button element
 * @param {HTMLElement} window - Window element
 * @param {HTMLElement} copyButton - Copy button element
 * @param {string} sqlQuery - SQL query for copy functionality
 */
function attachEventListeners(closeButton, window, copyButton, sqlQuery) {
    closeButton.addEventListener('click', () => window.remove());
    copyButton.onclick = () => copyToClipboard(sqlQuery, copyButton);
}


/**
 * Creates a new preview window
 * @param {string} sqlQuery - SQL query to display
 * @param {HTMLElement} buttonContainer - Container to insert window after
 * @returns {HTMLElement} New window element
 */
function createNewWindow(sqlQuery, buttonContainer) {
    const windowStructure = createWindowStructure();
    const { copyButton, closeButton, codeContainer } = createWindowComponents(sqlQuery);

    assembleWindow(windowStructure, copyButton, closeButton, codeContainer);
    insertIntoDOM(windowStructure.previewWindow, buttonContainer);
    attachEventListeners(closeButton, windowStructure.previewWindow, copyButton, sqlQuery);

    return windowStructure.previewWindow;
}


/**
 * Creates or updates a query preview window
 * @param {string} sqlQuery - The SQL query to display
 * @param {HTMLElement} triggerButton - The button that triggered the preview
 * @returns {HTMLElement} The preview window element
 */
function createOrUpdateQueryPreview(sqlQuery, triggerButton) {
    const buttonContainer = triggerButton.parentNode;
    const existingWindow = findExistingWindow(buttonContainer);

    if (existingWindow) {
        return updateExistingWindow(existingWindow, sqlQuery);
    }

    return createNewWindow(sqlQuery, buttonContainer);
}


/**
 * Shows or updates a query preview window
 * @param {string} sqlQuery - SQL query to display
 * @param {HTMLElement} triggerButton - Button that triggered the preview
 */
async function showPreview(sqlQuery, triggerButton) {
    createOrUpdateQueryPreview(sqlQuery, triggerButton);
}


/**
 * Extracts data attributes from button element
 * @param {HTMLElement} button - Button element with data attributes
 * @returns {Object} Extracted data
 */
function extractButtonData(button) {
    return {
        projectKey: button.dataset.project,
        datasetName: button.dataset.dataset,
        tableName: button.dataset.table,
        columnNames: JSON.parse(button.dataset.columns)
    };
}


/**
 * Handles query generation button clicks
 * @param {HTMLElement} button - The clicked button
 */
async function handleQueryGeneration(button) {
    try {
        const { projectKey, datasetName, tableName, columnNames } = extractButtonData(button);
        const query = generateQuery(projectKey, datasetName, tableName, columnNames);
        await showPreview(query, button);
    } catch (error) {
        console.error('Error generating query:', error);
    }
}


/**
 * Attaches click handlers to query generation buttons
 */
function attachClickHandlers() {
    document.addEventListener('click', (event) => {
        const queryButton = event.target.closest(CONFIG.selectors.queryButton);
        if (queryButton) {
            handleQueryGeneration(queryButton);
        }
    });
}


/**
 * Initializes all event handlers
 */
function initializeEventHandlers() {
    attachClickHandlers();
}


/**
 * Escapes HTML special characters
 * @param {string} code - Code to escape
 * @returns {string} Escaped code
 */
function escapeHTMLCharacters(code) {
    return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}


/**
 * Creates plain text HTML with proper escaping
 * @param {string} code - Code to convert to HTML
 * @returns {string} HTML string with escaped content
 */
function createPlainTextHTML(code) {
    const escapedCode = escapeHTMLCharacters(code);
    return `<pre style="${CONFIG.styling.fallbackStyle}"><code>${escapedCode}</code></pre>`;
}


/**
 * Initializes the BigQuery application
 */
function initializeBigQueryApp() {
    initializeEventHandlers();
}


function initializeApplication() {
    initializeBigQueryApp();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
    initializeApplication();
}
