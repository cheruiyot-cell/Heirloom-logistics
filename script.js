/* ============================================
   Heirloom Logistics - Complete JavaScript
   Premium Moving Company Website
   All Interactive Functionality
   Version 2.0 - Updated with Guide Tracking
   ============================================ */

'use strict';

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
    lazyImages: document.querySelectorAll('img[data-src]'),
    scrollLinks: document.querySelectorAll('a[href^="#"]'),
    currentYear: document.getElementById('current-year'),
    lastModified: document.getElementById('last-modified'),
    guideLinks: document.querySelectorAll('a[href*="packing-guide"], button[onclick*="window.print"]'),
    checklistItems: document.querySelectorAll('.checklist-category input[type="checkbox"]')
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
 * Format phone number for display
 * @param {string} phone - Raw phone number
 * @returns {string} - Formatted phone number
 */
function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return cleaned.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
    }
    if (cleaned.length === 12) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{3})/, '+$1 $2 $3 $4');
    }
    return phone;
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} element - The element to check
 * @returns {boolean} - True if in viewport
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Get current year
 * @returns {number} - Current year
 */
function getCurrentYear() {
    return new Date().getFullYear();
}

/**
 * Save data to localStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn('localStorage not available:', error);
    }
}

/**
 * Get data from localStorage
 * @param {string} key - Storage key
 * @returns {any} - Retrieved value or null
 */
function getFromLocalStorage(key) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        console.warn('localStorage not available:', error);
        return null;
    }
}

/* ============================================
   Header & Navigation Functions
   ============================================ */

/**
 * Handle header scroll effect
 * Adds shadow to header when user scrolls down
 */
function handleHeaderScroll() {
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
    const isOpen = DOM.hamburger.classList.toggle('active');
    DOM.mainNav.classList.toggle('active');
    DOM.hamburger.setAttribute('aria-expanded', isOpen);
    
    // Prevent body scroll when menu is open
    if (isOpen) {
        DOM.body.style.overflow = 'hidden';
    } else {
        DOM.body.style.overflow = '';
    }
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
    if (DOM.mainNav && DOM.hamburger) {
        DOM.mainNav.classList.remove('active');
        DOM.hamburger.classList.remove('active');
        DOM.hamburger.setAttribute('aria-expanded', 'false');
        DOM.body.style.overflow = '';
    }
}

/**
 * Close mobile menu when clicking outside
 * @param {Event} event - Click event
 */
function closeMobileMenuOnOutsideClick(event) {
    if (
        DOM.mainNav &&
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
    if (event.key === 'Escape' && DOM.mainNav && DOM.mainNav.classList.contains('active')) {
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
            if (DOM.mainNav && DOM.mainNav.classList.contains('active')) {
                closeMobileMenu();
            }
            
            // Update URL without page jump
            history.pushState(null, null, targetId);
        }
    }
}

/* ============================================
   Form Validation & Submission
   ============================================ */

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
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid
 */
function isValidPhone(phone) {
    const phoneRegex = /^(\+?254|0)?[71]\d{8}$/;
    return phoneRegex.test(phone.replace(/[\s-]/g, ''));
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
    const errorElement = field.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
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
 * Show error message on field
 * @param {HTMLElement} field - The field with error
 * @param {string} message - Error message to display
 */
function showFieldError(field, message) {
    field.classList.add('error');
    const errorElement = field.nextElementSibling;
    
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    } else {
        // Create error element if it doesn't exist
        const newError = document.createElement('span');
        newError.classList.add('error-message');
        newError.textContent = message;
        newError.style.display = 'block';
        field.insertAdjacentElement('afterend', newError);
    }
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
 * Handle form submission to Formspree
 * @param {Event} event - Submit event
 */
async function handleFormSubmission(event) {
    event.preventDefault();
    const form = event.currentTarget;
    
    // Validate form
    if (!validateForm(form)) {
        // Focus first error field
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
        const formData = new FormData(form);
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (response.ok) {
            // Track successful form submission
            trackEvent('form_submission', {
                form_name: form.id || 'unknown',
                page: window.location.pathname
            });
            
            // Success - redirect to thank you page
            window.location.href = 'thank-you.html';
        } else {
            throw new Error('Form submission failed');
        }
    } catch (error) {
        console.error('Form submission error:', error);
        
        // Show error message
        showFormError(form, 'Something went wrong. Please try again or contact us via WhatsApp at 0702555093.');
        
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
        const errorElement = field.nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
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
    });
}

/* ============================================
   Lazy Loading Images
   ============================================ */

/**
 * Initialize lazy loading for images
 */
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    loadImage(img);
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });
        
        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for browsers without IntersectionObserver
        images.forEach(img => loadImage(img));
    }
}

/**
 * Load image from data-src
 * @param {HTMLImageElement} img - Image element
 */
function loadImage(img) {
    const src = img.getAttribute('data-src');
    if (src) {
        img.src = src;
        img.removeAttribute('data-src');
        
        // Add fade-in animation
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.5s ease';
        img.onload = () => {
            img.style.opacity = '1';
        };
    }
}

/* ============================================
   Scroll Animations
   ============================================ */

/**
 * Initialize scroll reveal animations
 */
function initScrollAnimations() {
    const elements = document.querySelectorAll('[data-animate]');
    
    if ('IntersectionObserver' in window) {
        const animationObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const animationType = element.getAttribute('data-animate');
                    const delay = element.getAttribute('data-animate-delay') || 0;
                    
                    setTimeout(() => {
                        element.classList.add('animated', animationType);
                    }, delay);
                    
                    observer.unobserve(element);
                }
            });
        }, {
            threshold: 0.1
        });
        
        elements.forEach(el => animationObserver.observe(el));
    } else {
        // Fallback: show all elements
        elements.forEach(el => el.classList.add('animated'));
    }
}

/* ============================================
   Guide Download Tracking
   ============================================ */

/**
 * Track guide downloads and interactions
 */
function trackGuideDownload() {
    const guideLinks = document.querySelectorAll('a[href*="packing-guide"]');
    const printButtons = document.querySelectorAll('button[onclick*="window.print"]');
    
    // Track guide page visits
    guideLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            trackEvent('guide_download', {
                source: 'link_click',
                page: window.location.pathname,
                href: link.getAttribute('href')
            });
            
            console.log('📥 Packing guide accessed from:', window.location.pathname);
        });
    });
    
    // Track print/save actions
    printButtons.forEach(button => {
        button.addEventListener('click', () => {
            trackEvent('guide_print', {
                source: 'print_button',
                page: window.location.pathname
            });
            
            console.log('🖨️ Packing guide printed/saved as PDF');
        });
    });
    
    // Check if user is on the guide page
    if (window.location.pathname.includes('packing-guide')) {
        trackEvent('guide_page_view', {
            page: window.location.pathname,
            referrer: document.referrer || 'direct'
        });
        
        console.log('📖 Packing guide page viewed');
    }
}

/**
 * Track checklist interactions on guide page
 */
function initChecklistTracking() {
    if (!DOM.checklistItems || DOM.checklistItems.length === 0) return;
    
    DOM.checklistItems.forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            const label = event.target.nextElementSibling;
            const itemName = label ? label.textContent : 'unknown';
            
            // Save checkbox state to localStorage
            const savedItems = getFromLocalStorage('checklistItems') || {};
            savedItems[event.target.id] = event.target.checked;
            saveToLocalStorage('checklistItems', savedItems);
            
            // Track first interaction only
            if (!event.target.dataset.tracked) {
                trackEvent('guide_checklist_interaction', {
                    item: itemName,
                    action: event.target.checked ? 'checked' : 'unchecked'
                });
                event.target.dataset.tracked = 'true';
            }
        });
    });
    
    // Restore checkbox states from localStorage
    const savedItems = getFromLocalStorage('checklistItems') || {};
    DOM.checklistItems.forEach(checkbox => {
        if (savedItems[checkbox.id]) {
            checkbox.checked = true;
        }
    });
}

/* ============================================
   Current Year & Last Modified
   ============================================ */

/**
 * Update current year in footer
 */
function updateCurrentYear() {
    if (DOM.currentYear) {
        DOM.currentYear.textContent = getCurrentYear();
    }
}

/**
 * Update last modified date
 */
function updateLastModified() {
    if (DOM.lastModified) {
        const lastModified = new Date(document.lastModified);
        DOM.lastModified.textContent = lastModified.toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

/* ============================================
   WhatsApp Integration
   ============================================ */

/**
 * Initialize WhatsApp click tracking
 */
function initWhatsAppLinks() {
    const whatsappLinks = document.querySelectorAll('a[href*="wa.me"]');
    
    whatsappLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            trackEvent('whatsapp_click', {
                source: link.className || 'unknown',
                page: window.location.pathname
            });
            
            console.log('💬 WhatsApp link clicked');
        });
    });
}

/* ============================================
   Phone Call Integration
   ============================================ */

/**
 * Initialize phone call tracking
 */
function initPhoneLinks() {
    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
    
    phoneLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            trackEvent('phone_call', {
                source: link.className || 'unknown',
                page: window.location.pathname,
                phone: link.getAttribute('href')
            });
            
            console.log('📞 Phone link clicked:', link.getAttribute('href'));
        });
    });
}

/* ============================================
   Sticky Mobile CTA
   ============================================ */

/**
 * Handle sticky mobile CTA visibility
 */
function handleStickyCTA() {
    const stickyCTA = document.querySelector('.sticky-mobile-cta');
    const footer = document.querySelector('.site-footer');
    
    if (!stickyCTA || !footer) return;
    
    const footerTop = footer.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    
    // Hide sticky CTA when footer is visible
    if (footerTop < windowHeight) {
        stickyCTA.style.display = 'none';
    } else {
        stickyCTA.style.display = 'flex';
    }
}

/* ============================================
   Keyboard Navigation
   ============================================ */

/**
 * Initialize keyboard navigation enhancements
 */
function initKeyboardNavigation() {
    // Add keyboard support to FAQ questions
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.setAttribute('tabindex', '0');
        question.setAttribute('role', 'button');
        
        question.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                question.click();
            }
        });
    });
    
    // Add keyboard support to selection cards
    const selectionCards = document.querySelectorAll('.selection-card');
    selectionCards.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'link');
        
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                window.location.href = card.getAttribute('href') || '#';
            }
        });
    });
}

/* ============================================
   Analytics & Event Tracking
   ============================================ */

/**
 * Track custom event
 * @param {string} eventName - Name of the event
 * @param {Object} eventData - Additional data
 */
function trackEvent(eventName, eventData = {}) {
    const event = {
        name: eventName,
        data: eventData,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
    };
    
    // Console logging for development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('[TRACKING]', event);
    }
    
    // Google Analytics integration (if available)
    if (typeof gtag === 'function') {
        gtag('event', eventName, {
            ...eventData,
            page_path: window.location.pathname
        });
    }
    
    // Facebook Pixel integration (if available)
    if (typeof fbq === 'function') {
        fbq('trackCustom', eventName, eventData);
    }
    
    // Store events in localStorage for debugging
    const events = getFromLocalStorage('trackedEvents') || [];
    events.push(event);
    
    // Keep only last 50 events
    if (events.length > 50) {
        events.shift();
    }
    
    saveToLocalStorage('trackedEvents', events);
}

/* ============================================
   Performance Optimizations
   ============================================ */

/**
 * Debounced scroll handler for performance
 */
const debouncedHeaderScroll = debounce(handleHeaderScroll, 10);
const debouncedStickyCTA = debounce(handleStickyCTA, 100);

/* ============================================
   Event Listeners Initialization
   ============================================ */

/**
 * Initialize all event listeners
 */
function initEventListeners() {
    // Header scroll
    window.addEventListener('scroll', () => {
        debouncedHeaderScroll();
        debouncedStickyCTA();
    }, { passive: true });
    
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
    
    // Window resize
    window.addEventListener('resize', debounce(() => {
        handleStickyCTA();
    }, 250));
}

/* ============================================
   Add CSS Animations Dynamically
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
        
        /* Scroll Reveal Animations */
        [data-animate] {
            opacity: 0;
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        [data-animate].animated {
            opacity: 1;
        }
        
        [data-animate="fade-up"] {
            transform: translateY(30px);
        }
        
        [data-animate="fade-up"].animated {
            transform: translateY(0);
        }
        
        [data-animate="fade-left"] {
            transform: translateX(-30px);
        }
        
        [data-animate="fade-left"].animated {
            transform: translateX(0);
        }
        
        [data-animate="fade-right"] {
            transform: translateX(30px);
        }
        
        [data-animate="fade-right"].animated {
            transform: translateX(0);
        }
        
        [data-animate="zoom-in"] {
            transform: scale(0.9);
        }
        
        [data-animate="zoom-in"].animated {
            transform: scale(1);
        }
        
        /* Form Error Animation */
        .form-error {
            animation: slideIn 0.3s ease;
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Checklist Checkbox Animation */
        .checklist-category input[type="checkbox"]:checked + label {
            text-decoration: line-through;
            color: #999;
            transition: all 0.3s ease;
        }
    `;
    
    document.head.appendChild(styleElement);
}

/* ============================================
   Initialize Everything on DOM Ready
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Add dynamic styles
    addDynamicStyles();
    
    // Initialize all event listeners
    initEventListeners();
    
    // Initialize components
    initFAQAccordion();
    initLazyLoading();
    initScrollAnimations();
    initWhatsAppLinks();
    initPhoneLinks();
    initKeyboardNavigation();
    
    // Initialize guide tracking (NEW)
    trackGuideDownload();
    initChecklistTracking();
    
    // Update dynamic content
    updateCurrentYear();
    updateLastModified();
    
    // Initial states
    handleHeaderScroll();
    handleStickyCTA();
    
    // Track page view
    trackEvent('page_view', {
        page: window.location.pathname,
        title: document.title,
        referrer: document.referrer || 'direct'
    });
    
    // Log initialization
    console.log('✅ Heirloom Logistics website initialized successfully');
    console.log('📄 Page:', document.title);
    console.log('📍 URL:', window.location.href);
});

/* ============================================
   Handle Page Visibility (Performance)
   ============================================ */

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Page is hidden - pause any heavy operations
        console.log('⏸️ Page hidden - pausing operations');
    } else {
        // Page is visible - resume operations
        handleHeaderScroll();
        handleStickyCTA();
        console.log('▶️ Page visible - resuming operations');
    }
});

/* ============================================
   Handle Online/Offline Status
   ============================================ */

window.addEventListener('online', () => {
    console.log('✅ Internet connection restored');
    // Re-enable form submit button if it was disabled
    if (DOM.quoteForm) {
        const submitButton = DOM.quoteForm.querySelector('button[type="submit"]');
        if (submitButton && submitButton.disabled) {
            submitButton.disabled = false;
            submitButton.textContent = 'Request My Free Quote';
        }
    }
});

window.addEventListener('offline', () => {
    console.log('❌ Internet connection lost');
    // Disable form submit button
    if (DOM.quoteForm) {
        const submitButton = DOM.quoteForm.querySelector('button[type="submit"]');
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = 'No Internet Connection';
        }
    }
});

/* ============================================
   Export Functions for Testing/Debugging
   ============================================ */

// Expose key functions to global scope for debugging
window.HeirloomLogistics = {
    toggleMobileMenu,
    closeMobileMenu,
    validateForm,
    handleFormSubmission,
    formatPhoneNumber,
    isValidEmail,
    isValidPhone,
    getCurrentYear,
    trackEvent,
    trackGuideDownload,
    initChecklistTracking,
    version: '2.0.0'
};

/* ============================================
   Console Welcome Message
   ============================================ */

console.log('%c Heirloom Logistics %c v2.0.0 ',
    'background: #1A1A1A; color: #B08D57; font-size: 16px; padding: 4px;',
    'background: #B08D57; color: #1A1A1A; font-size: 12px; padding: 4px;'
);
console.log('%c Moving You Forward, Safely. ', 'color: #4A4A4A; font-style: italic;');