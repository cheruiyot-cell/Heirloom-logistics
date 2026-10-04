/* ============================================
   Heirloom Logistics - Complete JavaScript
   Version 5.0
   ============================================ */

'use strict';

const DEBUG = ['localhost', '127.0.0.1'].includes(window.location.hostname);
function log(...args) { if (DEBUG) console.log(...args); }

/* Config — must match style.css breakpoint */
const MOBILE_BREAKPOINT = '(max-width: 768px)';
const WHATSAPP_NUMBER = '254702555093';

const DOM = {
    header: document.getElementById('site-header'),
    hamburger: document.getElementById('hamburger'),
    mainNav: document.getElementById('main-nav'),
    quoteForm: document.getElementById('quote-form'),
    formStatus: document.getElementById('form-status'),
    currentYear: document.getElementById('current-year'),
    stickyCTA: document.querySelector('.sticky-mobile-cta'),
    footer: document.querySelector('.site-footer'),
    checklistItems: document.querySelectorAll('.checklist-category input[type="checkbox"]'),
    scrollLinks: document.querySelectorAll('a[href^="#"]')
};

/* ---------- Utilities ---------- */
function debounce(func, wait = 100) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => { clearTimeout(timeout); func(...args); };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
function getCurrentYear() { return new Date().getFullYear(); }
function saveToLocalStorage(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (e) { log('localStorage not available:', e); }
}
function getFromLocalStorage(key) {
    try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : null;
    } catch (e) { log('localStorage not available:', e); return null; }
}

/* ---------- Header & Navigation ---------- */
function handleHeaderScroll() {
    if (!DOM.header) return;
    DOM.header.classList.toggle('scrolled', window.scrollY > 50);
}

function toggleMobileMenu() {
    if (!DOM.hamburger || !DOM.mainNav) return;
    const isOpen = DOM.hamburger.classList.toggle('active');
    DOM.mainNav.classList.toggle('active');
    DOM.hamburger.setAttribute('aria-expanded', String(isOpen));
}

function closeMobileMenu() {
    if (!DOM.mainNav || !DOM.hamburger) return;
    DOM.mainNav.classList.remove('active');
    DOM.hamburger.classList.remove('active');
    DOM.hamburger.setAttribute('aria-expanded', 'false');
}

function closeMobileMenuOnOutsideClick(event) {
    if (DOM.mainNav && DOM.mainNav.classList.contains('active') &&
        !DOM.mainNav.contains(event.target) &&
        !DOM.hamburger.contains(event.target)) {
        closeMobileMenu();
    }
}

function closeMobileMenuOnEscape(event) {
    if (event.key === 'Escape' && DOM.mainNav && DOM.mainNav.classList.contains('active')) {
        closeMobileMenu();
        if (DOM.hamburger) DOM.hamburger.focus();
    }
}

/* ---------- Smooth Scroll ---------- */
function smoothScrollToTarget(event) {
    const anchor = event.currentTarget;
    const targetId = anchor.getAttribute('href');
    if (!targetId || targetId === '#' || !targetId.startsWith('#')) return;
    if (anchor.classList.contains('skip-link')) return;

    const targetElement = document.querySelector(targetId);
    if (!targetElement) return;

    event.preventDefault();
    const headerHeight = DOM.header ? DOM.header.offsetHeight : 0;
    const top = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
    window.scrollTo({ top, behavior: 'smooth' });

    if (DOM.mainNav && DOM.mainNav.classList.contains('active')) closeMobileMenu();
    history.pushState(null, '', targetId);
}

/* ---------- Form Validation ---------- */
function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
function isValidPhone(phone) {
    return /^(\+?254|0)?[71]\d{8}$/.test(phone.replace(/[\s-]/g, ''));
}

function showFieldError(field, message) {
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
    const el = field.parentElement.querySelector('.error-message');
    if (el) { el.textContent = message; el.style.display = 'block'; }
}

function clearFieldError(field) {
    field.classList.remove('error');
    field.removeAttribute('aria-invalid');
    const el = field.parentElement.querySelector('.error-message');
    if (el) { el.textContent = ''; el.style.display = 'none'; }
}

function validateField(field) {
    const value = field.value.trim();
    clearFieldError(field);

    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'This field is required'); return false;
    }
    if (field.type === 'email' && value && !isValidEmail(value)) {
        showFieldError(field, 'Please enter a valid email address'); return false;
    }
    if (field.type === 'tel' && value && !isValidPhone(value)) {
        showFieldError(field, 'Please enter a valid phone number (e.g., 07XX XXX XXX)'); return false;
    }
    if (field.name === 'name' && value && value.length < 2) {
        showFieldError(field, 'Name must be at least 2 characters'); return false;
    }
    return true;
}

function validateForm(form) {
    let isValid = true;
    form.querySelectorAll('[required]').forEach(f => {
        if (!validateField(f)) isValid = false;
    });
    return isValid;
}

/* ---------- WhatsApp Message Builder ---------- */
function buildWhatsAppMessage(formData) {
    const get = (key) => (formData.get(key) || '').toString().trim();

    const lines = [
        '*New Moving Quote Request*',
        '',
        `*Name:* ${get('name')}`,
        `*Email:* ${get('email')}`,
        `*Phone:* ${get('phone')}`,
        '',
        `*Moving From:* ${get('moving_from')}`,
        `*Moving To:* ${get('moving_to')}`
    ];

    const items = get('items');
    if (items) {
        lines.push('', '*Items:*', items);
    }

    lines.push('', '_Sent from heirloomlogistics.co.ke_');
    return lines.join('\n');
}

function buildWhatsAppUrl(message) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/* ---------- Form Success Feedback ---------- */
function showFormSuccess(form, waUrl) {
    const existing = form.querySelector('.form-success');
    if (existing) existing.remove();

    const success = document.createElement('div');
    success.classList.add('form-success');
    success.setAttribute('role', 'status');
    success.innerHTML =
        '<strong>Opening WhatsApp…</strong>' +
        '<span>If nothing happens, ' +
        `<a href="${waUrl}">tap here to open WhatsApp</a>.` +
        '</span>';

    const submitButton = form.querySelector('button[type="submit"]');
    form.insertBefore(success, submitButton);

    if (DOM.formStatus) {
        DOM.formStatus.textContent = 'Opening WhatsApp with your quote request.';
    }
}

/* ---------- Form submission → WhatsApp ---------- */
function handleFormSubmission(event) {
    event.preventDefault();
    const form = event.currentTarget;

    // Honeypot — silently ignore JS-running bots
    const gotcha = form.querySelector('input[name="_gotcha"]');
    if (gotcha && gotcha.value.trim()) {
        log('Honeypot triggered — ignoring submission');
        return;
    }

    if (!validateForm(form)) {
        const firstError = form.querySelector('.error');
        if (firstError) firstError.focus();
        return;
    }

    const formData = new FormData(form);
    const message = buildWhatsAppMessage(formData);
    const waUrl = buildWhatsAppUrl(message);

    trackEvent('form_submission', {
        form_name: form.id || 'unknown',
        channel: 'whatsapp'
    });

    showFormSuccess(form, waUrl);

    // Navigate to WhatsApp in the same tab.
    window.location.href = waUrl;
}

function handleFieldBlur(event) { validateField(event.currentTarget); }
function handleFieldInput(event) {
    if (event.currentTarget.classList.contains('error')) clearFieldError(event.currentTarget);
}

/* ---------- FAQ Accordion ---------- */
function initFAQAccordion() {
    const items = document.querySelectorAll('.faq-item');
    if (!items.length) return;

    items.forEach(item => {
        const btn = item.querySelector('.faq-question');
        const icon = item.querySelector('.faq-icon');
        if (!btn) return;

        btn.addEventListener('click', () => {
            const isOpen = item.classList.contains('is-open');

            items.forEach(other => {
                other.classList.remove('is-open');
                const oBtn = other.querySelector('.faq-question');
                const oIcon = other.querySelector('.faq-icon');
                if (oBtn) oBtn.setAttribute('aria-expanded', 'false');
                if (oIcon) oIcon.textContent = '+';
            });

            if (!isOpen) {
                item.classList.add('is-open');
                btn.setAttribute('aria-expanded', 'true');
                if (icon) icon.textContent = '−';
            }
        });
    });
}

/* ---------- Sticky CTA ---------- */
function handleStickyCTA() {
    if (!DOM.stickyCTA || !DOM.footer) return;

    // Respect the CSS breakpoint — never fight a media query with inline styles.
    if (!window.matchMedia(MOBILE_BREAKPOINT).matches) {
        DOM.stickyCTA.style.display = '';
        return;
    }

    const footerTop = DOM.footer.getBoundingClientRect().top;
    DOM.stickyCTA.style.display = footerTop < window.innerHeight ? 'none' : 'flex';
}

/* ---------- Dynamic Content ---------- */
function updateCurrentYear() {
    if (DOM.currentYear) DOM.currentYear.textContent = getCurrentYear();
}

/* ---------- Analytics (dev-log only by default) ---------- */
function trackEvent(eventName, eventData = {}) {
    const event = {
        name: eventName,
        data: eventData,
        timestamp: new Date().toISOString(),
        url: window.location.href
    };
    log('[TRACKING]', event);

    // Hook up real analytics later by defining gtag() or fbq()
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

/* ---------- Guide Tracking ---------- */
function trackGuideDownload() {
    document.querySelectorAll('a[href*="packing-guide"]').forEach(link => {
        link.addEventListener('click', () => {
            trackEvent('guide_download', {
                source: 'link_click',
                href: link.getAttribute('href')
            });
        });
    });

    if (window.location.pathname.includes('packing-guide')) {
        trackEvent('guide_page_view', { referrer: document.referrer || 'direct' });
    }
}

function initChecklistTracking() {
    if (!DOM.checklistItems.length) return;

    const saved = getFromLocalStorage('checklistItems') || {};
    DOM.checklistItems.forEach(checkbox => {
        if (saved[checkbox.id]) checkbox.checked = true;

        checkbox.addEventListener('change', (event) => {
            const state = getFromLocalStorage('checklistItems') || {};
            state[event.target.id] = event.target.checked;
            saveToLocalStorage('checklistItems', state);
        });
    });
}

/* ---------- Link Tracking ---------- */
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

/* ---------- Debounced Handlers ---------- */
const debouncedHeaderScroll = debounce(handleHeaderScroll, 10);
const debouncedStickyCTA = debounce(handleStickyCTA, 100);

/* ---------- Event Listeners ---------- */
function initEventListeners() {
    window.addEventListener('scroll', () => {
        debouncedHeaderScroll();
        debouncedStickyCTA();
    }, { passive: true });

    if (DOM.hamburger) DOM.hamburger.addEventListener('click', toggleMobileMenu);
    document.addEventListener('click', closeMobileMenuOnOutsideClick);
    document.addEventListener('keydown', closeMobileMenuOnEscape);

    DOM.scrollLinks.forEach(anchor => anchor.addEventListener('click', smoothScrollToTarget));

    if (DOM.quoteForm) {
        DOM.quoteForm.addEventListener('submit', handleFormSubmission);
        DOM.quoteForm.querySelectorAll('input, textarea').forEach(field => {
            field.addEventListener('blur', handleFieldBlur);
            field.addEventListener('input', handleFieldInput);
        });
    }

    const printBtn = document.getElementById('print-guide-btn');
    if (printBtn) printBtn.addEventListener('click', () => window.print());

    window.addEventListener('resize', debounce(() => {
        handleStickyCTA();
        if (!window.matchMedia(MOBILE_BREAKPOINT).matches) closeMobileMenu();
    }, 250));
}

/* ---------- Bootstrap ---------- */
document.addEventListener('DOMContentLoaded', () => {
    initEventListeners();
    initFAQAccordion();
    initWhatsAppLinks();
    initPhoneLinks();
    trackGuideDownload();
    initChecklistTracking();
    updateCurrentYear();
    handleHeaderScroll();
    handleStickyCTA();

    trackEvent('page_view', { title: document.title });
    log('Heirloom Logistics v5.0 initialized');
});

/* ---------- Online / Offline ---------- */
window.addEventListener('online', () => {
    log('Internet restored');
    if (DOM.quoteForm) {
        const btn = DOM.quoteForm.querySelector('button[type="submit"]');
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Send via WhatsApp';
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

/* ---------- Page Visibility ---------- */
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        handleHeaderScroll();
        handleStickyCTA();
    }
});

/* ---------- Public API (dev only) ---------- */
if (DEBUG) {
    window.HeirloomLogistics = {
        version: '5.0.0',
        trackEvent,
        validateForm,
        isValidEmail,
        isValidPhone,
        buildWhatsAppMessage,
        buildWhatsAppUrl
    };
    console.log('%c Heirloom Logistics %c v5.0.0 ',
        'background: #1A1A1A; color: #B08D57; font-size: 16px; padding: 4px;',
        'background: #8A6B3D; color: #fff; font-size: 12px; padding: 4px;'
    );
    console.log('%c Moving You Forward, Safely. ', 'color: #4A4A4A; font-style: italic;');
}