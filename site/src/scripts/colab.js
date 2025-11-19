import { generateColabSnippet, DEFAULT_SNIPPET_VALUES } from './colabTemplate.js';

/**
 * @fileoverview Handles Google Colab launch actions with a default BigQuery snippet.
 */

const COLAB_CONFIG = {
    defaultColabUrl: 'https://colab.research.google.com/#create=true',
    codeCopiedMessage: 'Código copiado! Cole no Colab e execute.',
    codeCopyErrorMessage: 'Não foi possível copiar o código automaticamente.',
    datasetCopiedMessage: 'ID copiado!',
    datasetCopyErrorMessage: 'Copie manualmente o ID da tabela.'
};

/**
 * Copies text to clipboard using the async API with a fallback.
 * @param {string} text
 * @returns {Promise<boolean>}
 */
async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (error) {
            console.warn('Clipboard API failed, falling back to execCommand.', error);
        }
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    let result = false;

    try {
        result = document.execCommand('copy');
    } catch (error) {
        console.warn('execCommand copy failed.', error);
    } finally {
        document.body.removeChild(textarea);
    }

    return result;
}

/**
 * Shows temporary feedback message inside the Colab card.
 * @param {HTMLElement} button
 * @param {string} message
 * @returns {void}
 */
function updateFeedback(button, message) {
    const card = button.closest('[data-colab-card]');
    if (!card) return;

    const feedbackEl = card.querySelector('[data-colab-feedback]');
    if (!feedbackEl) return;

    if (!feedbackEl.dataset.defaultMessage) {
        feedbackEl.dataset.defaultMessage = feedbackEl.textContent?.trim() || '';
    }

    feedbackEl.textContent = message;

    if (feedbackEl._colabTimeout) {
        clearTimeout(feedbackEl._colabTimeout);
    }

    feedbackEl._colabTimeout = setTimeout(() => {
        feedbackEl.textContent = feedbackEl.dataset.defaultMessage || '';
    }, 4000);
}

/**
 * Temporarily swaps button label to inform copy status.
 * @param {HTMLElement} element
 * @param {string} message
 * @param {number} duration
 */
function setTemporaryLabel(element, message, duration = 2000) {
    if (!element.dataset.originalLabel) {
        element.dataset.originalLabel = element.textContent?.trim() || '';
    }

    element.textContent = message;

    if (element._colabLabelTimeout) {
        clearTimeout(element._colabLabelTimeout);
    }

    element._colabLabelTimeout = setTimeout(() => {
        element.textContent = element.dataset.originalLabel || '';
    }, duration);
}

/**
 * Handles Colab button click: copies snippet and opens Colab.
 * @param {HTMLElement} button
 * @returns {Promise<void>}
 */
async function handleColabLaunch(button) {
    const datasetId = button.dataset.datasetId;
    const projectId = button.dataset.project;

    if (!datasetId) {
        console.warn('Colab launch attempted without table ID. Using placeholder value.');
    }

    const code = generateColabSnippet({
        tableId: datasetId || DEFAULT_SNIPPET_VALUES.tableId,
        projectId: projectId || DEFAULT_SNIPPET_VALUES.projectId
    });
    const copied = await copyText(code);

    if (copied) {
        updateFeedback(button, COLAB_CONFIG.codeCopiedMessage);
    } else {
        updateFeedback(button, COLAB_CONFIG.codeCopyErrorMessage);
    }

    const colabUrl = button.dataset.colabUrl || COLAB_CONFIG.defaultColabUrl;
    window.open(colabUrl, '_blank', 'noopener,noreferrer');
}

/**
 * Handles dataset ID copy button.
 * @param {HTMLElement} button
 * @returns {Promise<void>}
 */
async function handleDatasetIdCopy(button) {
    const datasetId = button.dataset.datasetId;
    if (!datasetId) {
        console.warn('Dataset ID copy attempted without value.');
        return;
    }

    const copied = await copyText(datasetId);
    if (copied) {
        setTemporaryLabel(button, COLAB_CONFIG.datasetCopiedMessage);
    } else {
        setTemporaryLabel(button, COLAB_CONFIG.datasetCopyErrorMessage);
    }
}

/**
 * Initializes Colab related listeners.
 */
function init() {
    document.addEventListener('click', (event) => {
        const colabButton = event.target.closest('[data-colab-launch]');
        if (colabButton) {
            event.preventDefault();
            handleColabLaunch(colabButton);
            return;
        }

        const copyButton = event.target.closest('[data-colab-copy]');
        if (copyButton) {
            event.preventDefault();
            handleDatasetIdCopy(copyButton);
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
