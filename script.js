/* ============================================
   Heirloom Logistics - Complete JavaScript
   Premium Moving Company Website
   Version 3.0 - Production-ready
   Audit fixes: dead code removed, console gated,
   accordion CSS-driven, form a11y, E.164
   ============================================ */

'use strict';

/* ============================================
   Debug flag (console output only in local dev)
   ============================================ */
const DEBUG = ['localhost', '127.0.0.1'].includes(window.location.hostname);

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
    formStatus: document.getElementById('form-status'),
    currentYear: document.getElementById('current-year'),
    stickyCTA: document.querySelector('.sticky-mobile-cta'),
    footer: document.querySelector('.site-footer'),
    checklistItems: document.querySelectorAll('.checklist-category input[type="checkbox"]'),
    scrollLinks: document.querySelectorAll('a[href^="#"]')
};

/* ============================================
   Utility Functions
   ============================================ */
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

function getCurrentYear() {
    return new Date().getFullYear();
}

function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        log('localStorage not available:', error);
    }
}

function getFromLocalStorage(key) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    } catch (error) {
        log('localStorage not available:', error);
        return null;
    }
}

/* ============================================
   Header & Navigation
   ============================================ */
function handleHeaderScroll() {
    if (!DOM.header) return;
    if (window.scrollY > 50) {
        DOM.header.classList.add('scrolled');
    } else {
        DOM.header.classList.remove('scrolled');
    }
}

function toggleMobileMenu() {
    if (!DOM.hamburger || !DOM.mainNav) return;
    const isOpen = DOM.hamburger.classList.toggle('active');
    DOM.mainNav.classList.toggle('active');
    DOM.hamburger.setAttribute('aria-expanded', String(isOpen));
    DOM.body.style.overflow = isOpen ? 'hidden' : '';
}

function closeMobileMenu() {
    if (!DOM.mainNav || !DOM.hamburger) return;
    DOM.mainNav.classList.remove('active');
    DOM.hamburger.classList.remove('active');
    DOM.hamburger.setAttribute('aria-expanded', 'false');
    DOM.body.style.overflow = '';
}

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

function closeMobileMenuOnEscape(event) {
    if (event.key === 'Escape' && DOM.mainNav && DOM.mainNav.classList.contains('active')) {
        closeMobileMenu();
    }
}

/* ============================================
   Smooth Scroll
   ============================================ */
function smoothScrollToTarget(event) {
    const targetId = event.currentTarget.getAttribute('href');
    if (!targetId || targetId === '#' || !targetId.startsWith('#')) return;
    const targetElement = document.querySelector(targetId);
    if (!targetElement) return;

    event.preventDefault();
    const headerHeight = DOM.header ? DOM.header.offsetHeight : 0;
    const top = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
    window.scrollTo({ top, behavior: 'smooth' });

    if (DOM.mainNav && DOM.mainNav.classList.contains('active')) closeMobileMenu();
    history.pushState(null, null, targetId);
}

/* ============================================
   Form Validation
   ============================================ */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^(\+?254|0)?[71]\d{8}$/.test(phone.replace(/[\s-]/g, ''));
}

function showFieldError(field, message) {
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
    const errorElement = field.parentElement.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearFieldError(field) {
    field.classList.remove('error');
    field.removeAttribute('aria-invalid');
    const errorElement = field.parentElement.querySelector('.error-message');
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
}

function validateField(field) {
    const value = field.value.trim();
    clearFieldError(field);

    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    if (field.type === 'email' && value && !isValidEmail(value)) {
        showFieldError(field, 'Please enter a valid email address');
        return false;
    }
    if (field.type === 'tel' && value && !isValidPhone(value)) {
        showFieldError(field, 'Please enter a valid phone number (e.g., 07XX XXX XXX)');
        return false;
    }
    if (field.name === 'name' && value && value.length < 2) {
        showFieldError(field, 'Name must be at least 2 characters');
        return false;
    }
    return true;
}

function validateForm(form) {
    const fields = form.querySelectorAll('[required]');
    let isValid = true;
    fields.forEach(field => {
        if (!validateField(field)) isValid = false;
    });
    return isValid;
}

function showFormError(form, message) {
    const existing = form.querySelector('.form-error');
    if (existing) existing.remove();

    const errorDiv = document.createElement('div');
    errorDiv.classList.add('form-error');
    errorDiv.setAttribute('role', 'alert');
    errorDiv.textContent = message;

    if (DOM.formStatus) {
        DOM.formStatus.textContent = message;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    form.insertBefore(errorDiv, submitButton);
}

async function handleFormSubmission(event) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!validateForm(form)) {
        const firstError = form.querySelector('.error');
        if (firstError) firstError.focus();
        return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner"></span> Sending...';
    submitButton.classList.add('loading');

    try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            trackEvent('form_submission', { form_name: form.id || 'unknown' });
            window.location.href = 'thank-you.html';
        } else {
            throw new Error('Form submission failed');
        }
    } catch (error) {
        log('Form submission error:', error);
        showFormError(form, 'Something went wrong. Please try again or contact us via WhatsApp at 0702 555 093.');
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonText;
        submitButton.classList.remove('loading');
        setTimeout(() => {
            const errorDiv = form.querySelector('.form-error');
            if (errorDiv) errorDiv.remove();
        }, 5000);
    }
}

function handleFieldBlur(event) {
    validateField(event.currentTarget);
}

function handleFieldInput(event) {
    if (event.currentTarget.classList.contains('error')) {
        clearFieldError(event.currentTarget);
    }
}

/* ============================================
   FAQ Accordion (CSS-driven state)
   ============================================ */
function initFAQAccordion() {
    const items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach(item => {
        const btn = item.querySelector('.faq-question');
        const icon = item.querySelector('.faq-icon');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('is-open');

            // Close all others
            items.forEach(other => {
                other.classList.remove('is-open');
                const oBtn = other.querySelector('.faq-question');
                const oIcon = other.querySelector('.faq-icon');
                if (oBtn) oBtn.setAttribute('aria-expanded', 'false');
                if (oIcon) oIcon.textContent = '+';
            });

            // Toggle this one open
            if (!isOpen) {
                item.classList.add('is-open');
                btn.setAttribute('aria-expanded', 'true');
                if (icon) icon.textContent = '−';
            }
        });
    });
}

/* ============================================
   Sticky Mobile CTA
   ============================================ */
function handleStickyCTA() {
    if (!DOM.stickyCTA || !DOM.footer) return;
    const footerTop = DOM.footer.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;
    DOM.stickyCTA.style.display = footerTop < windowHeight ? 'none' : 'flex';
}

/* ============================================
   Dynamic Content
   ============================================ */
function updateCurrentYear() {
    if (DOM.currentYear) {
        DOM.currentYear.textContent = getCurrentYear();
    }
}

/* ============================================
   Analytics
   ============================================ */
function trackEvent(eventName, eventData = {}) {
    const event = {
        name: eventName,
        data: eventData,
        timestamp: new Date().toISOString(),
        url: window.location.href
    };

    log('[TRACKING]', event);

    if (typeof gtag === 'function') {
        gtag('event', eventName, { ...eventData, page_path: window.location.pathname });
    }
    if (typeof fbq === 'function') {
        fbq('trackCustom', eventName, eventData);
    }

    const events = getFromLocalStorage('trackedEvents') || [];
    events.push(event);
    if (events.length > 50) events.shift();
    saveToLocalStorage('trackedEvents', events);
}

/* ============================================
   Guide Tracking
   ============================================ */
function trackGuideDownload() {
    document.querySelectorAll('a[href*="packing-guide"]').forEach(link => {
        link.addEventListener('click', () => {
            trackEvent('guide_download', {
                source: 'link_click',
                href: link.getAttribute('href')
            });
        });
    });

    document.querySelectorAll('button[onclick*="window.print"]').forEach(button => {
        button.addEventListener('click', () => {
            trackEvent('guide_print', { source: 'print_button' });
        });
    });

    if (window.location.pathname.includes('packing-guide')) {
        trackEvent('guide_page_view', { referrer: document.referrer || 'direct' });
    }
}

function initChecklistTracking() {
    if (!DOM.checklistItems.length) return;

    DOM.checklistItems.forEach(checkbox => {
        checkbox.addEventListener('change', (event) => {
            const saved = getFromLocalStorage('checklistItems') || {};
            saved[event.target.id] = event.target.checked;
            saveToLocalStorage('checklistItems', saved);
        });
    });

    const saved = getFromLocalStorage('checklistItems') || {};
    DOM.checklistItems.forEach(checkbox => {
        if (saved[checkbox.id]) checkbox.checked = true;
    });
}

/* ============================================
   Link Tracking
   ============================================ */
function initWhatsAppLinks() {
    document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
        link.addEventListener('click', () => {
            trackEvent('whatsapp_click', { source: link.className || 'unknown' });
        });
    });
}

function initPhoneLinks() {
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', () => {
            trackEvent('phone_call', { phone: link.getAttribute('href') });
        });
    });
}

/* ============================================
   Keyboard Navigation
   ============================================ */
function initKeyboardNavigation() {
    document.querySelectorAll('.faq-question').forEach(question => {
        question.setAttribute('role', 'button');
        question.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                question.click();
            }
        });
    });

    document.querySelectorAll('.selection-card').forEach(card => {
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
   Debounced Handlers
   ============================================ */
const debouncedHeaderScroll = debounce(handleHeaderScroll, 10);
const debouncedStickyCTA = debounce(handleStickyCTA, 100);

/* ============================================
   Event Listener Init
   ============================================ */
function initEventListeners() {
    window.addEventListener('scroll', () => {
        debouncedHeaderScroll();
        debouncedStickyCTA();
    }, { passive: true });

    if (DOM.hamburger) {
        DOM.hamburger.addEventListener('click', toggleMobileMenu);
    }

    document.addEventListener('click', closeMobileMenuOnOutsideClick);
    document.addEventListener('keydown', closeMobileMenuOnEscape);

    DOM.scrollLinks.forEach(anchor => {
        anchor.addEventListener('click', smoothScrollToTarget);
    });

    if (DOM.quoteForm) {
        DOM.quoteForm.addEventListener('submit', handleFormSubmission);
        DOM.quoteForm.querySelectorAll('input, textarea').forEach(field => {
            field.addEventListener('blur', handleFieldBlur);
            field.addEventListener('input', handleFieldInput);
        });
    }

    window.addEventListener('resize', debounce(handleStickyCTA, 250));
}

/* ============================================
   Bootstrap
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    initFAQAccordion();
    initWhatsAppLinks();
    initPhoneLinks();
    initKeyboardNavigation();
    trackGuideDownload();
    initChecklistTracking();
    updateCurrentYear();
    handleHeaderScroll();
    handleStickyCTA();

    trackEvent('page_view', { title: document.title });

    log('Heirloom Logistics v3.0 initialized');
    log('Page:', document.title);
    log('URL:', window.location.href);
});

/* ============================================
   Online / Offline
   ============================================ */
window.addEventListener('online', () => {
    log('Internet restored');
    if (DOM.quoteForm) {
        const btn = DOM.quoteForm.querySelector('button[type="submit"]');
        if (btn && btn.disabled) {
            btn.disabled = false;
            btn.textContent = 'Request My Free Quote';
        }
    }
});

window.addEventListener('offline', () => {
    log('Internet lost');
    if (DOM.quoteForm) {
        const btn = DOM.quoteForm.querySelector('button[type="submit"]');
        if (btn) {
            btn.disabled = true;
            btn.textContent = 'No Internet Connection';
        }
    }
});

/* ============================================
   Page Visibility
   ============================================ */
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        handleHeaderScroll();
        handleStickyCTA();
    }
});

/* ============================================
   Public API (for debugging)
   ============================================ */
window.HeirloomLogistics = {
    version: '3.0.0',
    trackEvent,
    validateForm,
    isValidEmail,
    isValidPhone
};

/* ============================================
   Console Banner (dev only)
   ============================================ */
if (DEBUG) {
    console.log('%c Heirloom Logistics %c v3.0.0 ',
        'background: #1A1A1A; color: #B08D57; font-size: 16px; padding: 4px;',
        'background: #B08D57; color: #1A1A1A; font-size: 12px; padding: 4px;'
    );
    console.log('%c Moving You Forward, Safely. ', 'color: #4A4A4A; font-style: italic;');
}