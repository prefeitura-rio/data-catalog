/**
 * @fileoverview Pagefind search initialization with Portuguese translations and data attribute support
 */

const defaultPortugueseTranslations = {
    placeholder: "Pesquisar por nome, descrição ou tabelas...",
    load_more: "Carregar mais resultados",
    search_label: "Pesquisar neste site",
    filters_label: "Filtros",
    zero_results: "Nenhum resultado encontrado para [SEARCH_TERM]",
    many_results: "[COUNT] resultados para [SEARCH_TERM]",
    one_result: "[COUNT] resultado para [SEARCH_TERM]",
    alt_search: "Nenhum resultado para [SEARCH_TERM]. Mostrando resultados para [DIFFERENT_TERM]",
    search_suggestion: "Tente pesquisar por [DIFFERENT_TERM]",
    searching: "Pesquisando por [SEARCH_TERM]..."
};

/**
 * Creates and initializes a Pagefind UI instance with optional custom placeholder text
 * @param {string} elementSelector - CSS selector for the search container element
 * @param {string} [placeholderText] - Optional custom placeholder text to override default
 * @returns {void}
 */
function createPagefindUIWithCustomPlaceholder(elementSelector, placeholderText) {
    if (typeof window.PagefindUI === 'undefined') {
        console.error('PagefindUI is not loaded. Make sure pagefind-ui.js is included before this script.');
        return;
    }

    const translationsWithCustomPlaceholder = placeholderText
        ? { ...defaultPortugueseTranslations, placeholder: placeholderText }
        : defaultPortugueseTranslations;

    new window.PagefindUI({
        element: elementSelector,
        showSubResults: true,
        placeholder: translationsWithCustomPlaceholder.placeholder,
        translations: translationsWithCustomPlaceholder
    });
}

/**
 * Initializes search functionality by reading data-search-placeholder attributes from DOM elements
 * Falls back to path-based initialization if no data attributes are found
 * @returns {void}
 */
function initializeSearchFromDataAttributes() {
    const searchContainersWithPlaceholders = document.querySelectorAll('[data-search-placeholder]');

    if (searchContainersWithPlaceholders.length > 0) {
        searchContainersWithPlaceholders.forEach(container => {
            const customPlaceholder = container.getAttribute('data-search-placeholder');
            const searchElement = container.querySelector('#search');
            if (searchElement) {
                createPagefindUIWithCustomPlaceholder(`#search`, customPlaceholder);
            }
        });
    } else {
        initializeSearchFromCurrentPath();
    }
}

/**
 * Fallback initialization method that determines search configuration based on current URL path
 * Provides backward compatibility for pages without data attributes
 * @returns {void}
 */
function initializeSearchFromCurrentPath() {
    const currentPath = window.location.pathname;

    if (currentPath === '/' || currentPath === '/index.html') {
        createPagefindUIWithCustomPlaceholder("#search", "Pesquisar datasets, tabelas ou esquemas...");
    } else if (currentPath === '/datasets/' || currentPath === '/datasets/index.html') {
        createPagefindUIWithCustomPlaceholder("#search", "Pesquisar por nome, descrição ou tabelas...");
    } else {
        createPagefindUIWithCustomPlaceholder("#search");
    }
}

document.addEventListener('DOMContentLoaded', initializeSearchFromDataAttributes);
window.initPagefindUI = createPagefindUIWithCustomPlaceholder;
