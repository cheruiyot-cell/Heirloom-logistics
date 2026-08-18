/* ============================================
   Heirloom Logistics - Production JavaScript
   Premium Moving Company Website
   ============================================ */

'use strict';

// Development mode flag - set to false in production
const DEBUG = false;

// Utility logging function
function log(...args) {
    if (DEBUG) console.log(...args);
}

/* ============================================
   DOM Element References
   ============================================ */
const DOM = {
    header: document.getElementById('site-header'),
    hamburger: document.getElementById('hamburger'),
    mainNav: document.getElementById('main-nav'),
    body: document.body,
    quoteForm: document.getElementById('quote-form'),
    faqItems: document.querySelectorAll('.faq-item'),
    scrollLinks: document.querySelectorAll('a[href^="#"]'),
    currentYear: document.getElementById('current-year'),
    stickyCTA: document.querySelector('.sticky-mobile-cta'),
    footer: document.querySelector('.site-footer')
};

/* ============================================
   Utility Functions
   ============================================ */

/**
 * Debounce function to limit event firing frequency
 * @param {Function} func - The function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait = 100) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Validate email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate phone number format (Kenyan numbers)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
function isValidPhone(phone) {
    const cleaned = phone.replace(/[\s-()]/g, '');
    // Accept: 07XXXXXXXX, 7XXXXXXXX, +2547XXXXXXXX
    const phoneRegex = /^(\+?254|0)?7\d{8}$/;
    return phoneRegex.test(cleaned);
}

/**
 * Sanitize input to prevent XSS
 * @param {string} value - Input to sanitize
 * @returns {string} - Sanitized value
 */
function sanitizeInput(value) {
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
}

/* ============================================
   Header & Navigation Functions
   ============================================ */

/**
 * Handle header scroll effect
 */
function handleHeaderScroll() {
    if (!DOM.header) return;
    if (window.scrollY > 50) {
        DOM.header.classList.add('scrolled');
    } else {
        DOM.header.classList.remove('scrolled');
    }
}

/**
 * Toggle mobile menu open/close
 */
function toggleMobileMenu() {
    if (!DOM.hamburger || !DOM.mainNav) return;
    
    const isOpen = DOM.hamburger.classList.toggle('active');
    DOM.mainNav.classList.toggle('active');
    DOM.hamburger.setAttribute('aria-expanded', isOpen);
    
    // Prevent body scroll when menu is open
    DOM.body.style.overflow = isOpen ? 'hidden' : '';
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
    if (!DOM.mainNav || !DOM.hamburger) return;
    
    DOM.mainNav.classList.remove('active');
    DOM.hamburger.classList.remove('active');
    DOM.hamburger.setAttribute('aria-expanded', 'false');
    DOM.body.style.overflow = '';
}

/**
 * Close mobile menu when clicking outside
 * @param {Event} event - Click event
 */
function closeMobileMenuOnOutsideClick(event) {
    if (!DOM.mainNav || !DOM.hamburger) return;
    
    if (
        DOM.mainNav.classList.contains('active') &&
        !DOM.mainNav.contains(event.target) &&
        !DOM.hamburger.contains(event.target)
    ) {
        closeMobileMenu();
    }
}

/**
 * Close mobile menu on escape key
 * @param {Event} event - Keydown event
 */
function closeMobileMenuOnEscape(event) {
    if (event.key === 'Escape' && DOM.mainNav?.classList.contains('active')) {
        closeMobileMenu();
    }
}

/* ============================================
   Smooth Scroll Functions
   ============================================ */

/**
 * Smooth scroll to target element
 * @param {Event} event - Click event
 */
function smoothScrollToTarget(event) {
    const targetId = event.currentTarget.getAttribute('href');
    
    if (targetId && targetId.startsWith('#') && targetId.length > 1) {
        event.preventDefault();
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const headerHeight = DOM.header ? DOM.header.offsetHeight : 0;
            const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Close mobile menu if open
            if (DOM.mainNav?.classList.contains('active')) {
                closeMobileMenu();
            }
            
            // Update URL without page jump
            history.pushState(null, null, targetId);
        }
    }
}

/* ============================================
   Form Validation & Submission (UPDATED)
   ============================================ */

/**
 * Show error message on field
 * @param {HTMLElement} field - The field with error
 * @param {string} message - Error message to display
 */
function showFieldError(field, message) {
    field.classList.add('error');
    // Find the error message container (next sibling or specific selector)
    let errorElement = field.nextElementSibling;
    
    // If the immediate sibling isn't an error message, search for it within the parent
    if (!errorElement || !errorElement.classList.contains('error-message')) {
        errorElement = field.parentElement.querySelector('.error-message');
    }

    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

/**
 * Validate form field
 * @param {HTMLInputElement|HTMLTextAreaElement} field - Form field to validate
 * @returns {boolean} - True if valid
 */
function validateField(field) {
    const value = field.value.trim();
    const fieldType = field.type;
    const fieldName = field.name;
    
    // Reset error state
    field.classList.remove('error');
    let errorElement = field.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains('error-message')) {
        errorElement = field.parentElement.querySelector('.error-message');
    }
    if (errorElement) {
        errorElement.style.display = 'none';
    }
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Email validation
    if (fieldType === 'email' && value && !isValidEmail(value)) {
        showFieldError(field, 'Please enter a valid email address');
        return false;
    }
    
    // Phone validation
    if (fieldType === 'tel' && value && !isValidPhone(value)) {
        showFieldError(field, 'Please enter a valid phone number (e.g., 07XX XXX XXX)');
        return false;
    }
    
    // Name validation
    if (fieldName === 'name' && value && value.length < 2) {
        showFieldError(field, 'Name must be at least 2 characters');
        return false;
    }
    
    return true;
}

/**
 * Validate entire form
 * @param {HTMLFormElement} form - Form to validate
 * @returns {boolean} - True if all fields are valid
 */
function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

/**
 * Show form-level error message
 * @param {HTMLFormElement} form - The form
 * @param {string} message - Error message
 */
function showFormError(form, message) {
    // Remove existing error
    const existingError = form.querySelector('.form-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Create new error
    const errorDiv = document.createElement('div');
    errorDiv.classList.add('form-error');
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        background-color: #f8d7da;
        color: #721c24;
        padding: 12px 16px;
        border-radius: 4px;
        margin-top: 16px;
        text-align: center;
        font-size: 14px;
    `;
    
    const submitButton = form.querySelector('button[type="submit"]');
    form.insertBefore(errorDiv, submitButton);
}

/**
 * Handle form submission to Formspree
 * @param {Event} event - Submit event
 */
async function handleFormSubmission(event) {
    event.preventDefault();
    const form = event.currentTarget;
    
    // Check for internet connection
    if (!navigator.onLine) {
        showFormError(form, 'You are offline. Please check your internet connection.');
        return;
    }
    
    // Check honeypot field
    const gotcha = form.querySelector('[name="_gotcha"]');
    if (gotcha && gotcha.value) {
        // Bot detected - silently fail
        log('Spam detected - honeypot triggered');
        return;
    }
    
    // Validate form
    if (!validateForm(form)) {
        const firstError = form.querySelector('.error');
        if (firstError) {
            firstError.focus();
        }
        return;
    }
    
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    
    // Show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner"></span> Sending...';
    submitButton.classList.add('loading');
    
    try {
        // Sanitize form data
        const formData = new FormData(form);
        const sanitizedData = new FormData();
        for (let [key, value] of formData.entries()) {
            // Skip hidden fields that don't need sanitization
            if (key.startsWith('_')) {
                sanitizedData.append(key, value);
            } else {
                sanitizedData.append(key, sanitizeInput(value));
            }
        }
        
        const response = await fetch(form.action, {
            method: 'POST',
            body: sanitizedData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            // Store submission timestamp in sessionStorage
            sessionStorage.setItem('formSubmitted', Date.now().toString());
            // Redirect to thank you page
            window.location.href = 'thank-you.html';
        } else {
            // Parse error response from Formspree
            const errorData = await response.json();
            throw new Error(errorData.error || 'Form submission failed');
        }
    } catch (error) {
        log('Form submission error:', error);
        
        // Show error message
        if (!navigator.onLine) {
            showFormError(form, 'No internet connection. Please try again when online.');
        } else {
            showFormError(form, 'Something went wrong. Please try again or contact us via WhatsApp at 0702555093.');
        }
        
        // Reset button
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
        submitButton.classList.remove('loading');
        
        // Remove error after 5 seconds
        setTimeout(() => {
            const errorDiv = form.querySelector('.form-error');
            if (errorDiv) {
                errorDiv.remove();
            }
        }, 5000);
    }
}

/**
 * Real-time field validation on blur
 * @param {Event} event - Blur event
 */
function handleFieldBlur(event) {
    const field = event.currentTarget;
    validateField(field);
}

/**
 * Real-time field validation on input (remove error)
 * @param {Event} event - Input event
 */
function handleFieldInput(event) {
    const field = event.currentTarget;
    if (field.classList.contains('error')) {
        field.classList.remove('error');
        let errorElement = field.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('error-message')) {
            errorElement = field.parentElement.querySelector('.error-message');
        }
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }
}

/* ============================================
   FAQ Accordion Functions
   ============================================ */

/**
 * Initialize FAQ accordion
 */
function initFAQAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = item.querySelector('.faq-icon');
        
        if (!question || !answer) return;
        
        // Initially hide all answers
        answer.style.display = 'none';
        
        question.addEventListener('click', () => {
            const isOpen = question.getAttribute('aria-expanded') === 'true';
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                const otherQuestion = otherItem.querySelector('.faq-question');
                const otherAnswer = otherItem.querySelector('.faq-answer');
                const otherIcon = otherItem.querySelector('.faq-icon');
                
                if (otherItem !== item) {
                    otherQuestion.setAttribute('aria-expanded', 'false');
                    otherAnswer.style.display = 'none';
                    if (otherIcon) otherIcon.textContent = '+';
                }
            });
            
            // Toggle current item
            if (isOpen) {
                question.setAttribute('aria-expanded', 'false');
                answer.style.display = 'none';
                if (icon) icon.textContent = '+';
            } else {
                question.setAttribute('aria-expanded', 'true');
                answer.style.display = 'block';
                if (icon) icon.textContent = '−';
            }
            
            // Animate answer
            answer.style.animation = 'fadeIn 0.3s ease';
        });
        
        // Keyboard support
        question.setAttribute('tabindex', '0');
        question.setAttribute('role', 'button');
        
        question.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                question.click();
            }
        });
    });
}

/* ============================================
   Sticky Mobile CTA
   ============================================ */

/**
 * Handle sticky mobile CTA visibility and body padding
 */
function handleStickyCTA() {
    if (!DOM.stickyCTA || !DOM.footer || window.innerWidth > 768) {
        if (DOM.body) DOM.body.style.paddingBottom = '0';
        return;
    }
    
    const footerTop = DOM.footer.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    
    // Show sticky CTA when footer is not visible
    if (footerTop > windowHeight) {
        DOM.stickyCTA.style.display = 'flex';
        DOM.body.style.paddingBottom = DOM.stickyCTA.offsetHeight + 'px';
    } else {
        DOM.stickyCTA.style.display = 'none';
        DOM.body.style.paddingBottom = '0';
    }
}

/* ============================================
   Keyboard Navigation Enhancements
   ============================================ */

/**
 * Initialize keyboard navigation enhancements
 */
function initKeyboardNavigation() {
    // Add keyboard support to selection cards
    const selectionCards = document.querySelectorAll('.selection-card');
    selectionCards.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'link');
        
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                const href = card.getAttribute('href');
                if (href) {
                    window.location.href = href;
                }
            }
        });
    });
}

/* ============================================
   Current Year Update
   ============================================ */

/**
 * Update current year in footer
 */
function updateCurrentYear() {
    if (DOM.currentYear) {
        DOM.currentYear.textContent = new Date().getFullYear().toString();
    }
}

/* ============================================
   Thank You Page Validation
   ============================================ */

/**
 * Validate that user arrived from form submission
 */
function validateThankYouPage() {
    const submitted = sessionStorage.getItem('formSubmitted');
    if (!submitted) {
        // Redirect back to contact page if form wasn't submitted
        window.location.href = 'contact.html';
    } else {
        // Clear the flag
        sessionStorage.removeItem('formSubmitted');
    }
}

/* ============================================
   Event Listeners Initialization
   ============================================ */

/**
 * Initialize all event listeners
 */
function initEventListeners() {
    // Header scroll
    const debouncedHeaderScroll = debounce(handleHeaderScroll, 10);
    window.addEventListener('scroll', debouncedHeaderScroll, { passive: true });
    
    // Sticky CTA
    const debouncedStickyCTA = debounce(handleStickyCTA, 100);
    window.addEventListener('scroll', debouncedStickyCTA, { passive: true });
    window.addEventListener('resize', debouncedStickyCTA, { passive: true });
    
    // Mobile menu
    if (DOM.hamburger) {
        DOM.hamburger.addEventListener('click', toggleMobileMenu);
    }
    
    // Close menu on outside click
    document.addEventListener('click', closeMobileMenuOnOutsideClick);
    
    // Close menu on escape key
    document.addEventListener('keydown', closeMobileMenuOnEscape);
    
    // Smooth scroll for anchor links
    DOM.scrollLinks.forEach(anchor => {
        anchor.addEventListener('click', smoothScrollToTarget);
    });
    
    // Form submission
    if (DOM.quoteForm) {
        DOM.quoteForm.addEventListener('submit', handleFormSubmission);
        
        // Real-time validation
        const formFields = DOM.quoteForm.querySelectorAll('input, textarea');
        formFields.forEach(field => {
            field.addEventListener('blur', handleFieldBlur);
            field.addEventListener('input', handleFieldInput);
        });
    }
}

/* ============================================
   Add Dynamic Styles
   ============================================ */

/**
 * Add required CSS animations to the page
 */
function addDynamicStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        /* Form Loading Spinner */
        .spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            border-top-color: #fff;
            animation: spin 0.6s linear infinite;
            margin-right: 8px;
            vertical-align: middle;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        /* Button Loading State */
        .btn.loading {
            opacity: 0.7;
            cursor: not-allowed;
        }
        
        /* FAQ Answer Fade In */
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    
    document.head.appendChild(styleElement);
}

/* ============================================
   Initialize Everything on DOM Ready
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    log('Heirloom Logistics website initializing...');
    
    // Add dynamic styles
    addDynamicStyles();
    
    // Initialize components
    initEventListeners();
    initFAQAccordion();
    initKeyboardNavigation();
    updateCurrentYear();
    
    // Initial states
    handleHeaderScroll();
    handleStickyCTA();
    
    // Check if on thank you page
    if (window.location.pathname.includes('thank-you.html')) {
        validateThankYouPage();
    }
    
    log('Heirloom Logistics website initialized successfully');
});

/* ============================================
   Online/Offline Status Handling
   ============================================ */

window.addEventListener('online', () => {
    log('Internet connection restored');
    // Remove any network error messages
    const formError = document.querySelector('.form-error');
    if (formError && formError.textContent.includes('internet')) {
        formError.remove();
    }
});

window.addEventListener('offline', () => {
    log('Internet connection lost');
    // Disable submit button if form exists
    if (DOM.quoteForm) {
        const submitButton = DOM.quoteForm.querySelector('button[type="submit"]');
        if (submitButton && !submitButton.disabled) {
            submitButton.disabled = true;
            submitButton.textContent = 'No Internet Connection';
        }
    }
});

// Export for debugging
if (DEBUG) {
    window.HeirloomLogistics = {
        validateForm,
        isValidEmail,
        isValidPhone,
        sanitizeInput
    };
}