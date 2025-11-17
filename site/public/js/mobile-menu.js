/**
 * @fileoverview Initializes the mobile menu toggle functionality for the navigation bar.
 */

/**
 * @function initMobileMenu
 * @description Sets up mobile menu toggle functionality
 * @requires DOM elements with IDs: 'mobile-menu-button' and 'mobile-menu'
 */
function initMobileMenu() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function() {
            const isHidden = mobileMenu.style.display === 'none';
            mobileMenu.style.display = isHidden ? 'block' : 'none';
            mobileMenuButton.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
        });
    }
}

document.addEventListener('DOMContentLoaded', initMobileMenu);
