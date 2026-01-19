/**
 * Bryan Campbell Portfolio - Main JavaScript
 * Version: 2.0
 * Description: Interactive functionality for portfolio website
 */

'use strict';

// ======================================
// 1. MOBILE MENU TOGGLE
// ======================================
const menuToggle = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');
const menuIcon = menuToggle.querySelector('i');

/**
 * Toggle mobile navigation menu
 */
function toggleMenu() {
    // Only toggle if on mobile view
    if (window.innerWidth <= 768) {
        navLinks.classList.toggle('active');
        menuIcon.classList.toggle('fa-bars');
        menuIcon.classList.toggle('fa-times');
        
        // Update ARIA attribute for accessibility
        const isExpanded = navLinks.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', isExpanded);
    }
}

// Event listener for menu toggle button
menuToggle.addEventListener('click', toggleMenu);

// Close menu when clicking outside
document.addEventListener('click', function(event) {
    const isClickInsideNav = navLinks.contains(event.target);
    const isClickOnToggle = menuToggle.contains(event.target);
    
    if (!isClickInsideNav && !isClickOnToggle && navLinks.classList.contains('active')) {
        toggleMenu();
    }
});

// Close menu on window resize to desktop
window.addEventListener('resize', function() {
    if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        menuIcon.classList.remove('fa-times');
        menuIcon.classList.add('fa-bars');
        menuToggle.setAttribute('aria-expanded', 'false');
    }
});

// ======================================
// 2. STICKY NAVBAR ON SCROLL
// ======================================
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    // Add solid background class when scrolled down more than 50px
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ======================================
// 3. SCROLL ANIMATION (INTERSECTION OBSERVER)
// ======================================
/**
 * Detects when elements enter the screen and fades them in
 */
const observerOptions = {
    threshold: 0.1, // Trigger when 10% visible
    rootMargin: '0px 0px -50px 0px' // Start animation slightly before element enters viewport
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
            // Optional: Stop observing after animation (performance optimization)
            // observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all elements with .hidden class
const hiddenElements = document.querySelectorAll('.hidden');
hiddenElements.forEach((el) => observer.observe(el));

// ======================================
// 4. ANIMATED STATISTICS COUNTERS
// ======================================
const counters = document.querySelectorAll('.counter');
const speed = 200; // The lower the slower

const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counter = entry.target;
            
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;
                
                // Calculate increment step
                const inc = target / speed;

                if (count < target) {
                    counter.innerText = Math.ceil(count + inc);
                    setTimeout(updateCount, 20);
                } else {
                    counter.innerText = target + "+"; // Add the + sign at the end
                }
            };
            
            updateCount();
            observer.unobserve(counter); // Only animate once
        }
    });
}, { threshold: 0.5 });

counters.forEach(counter => {
    counterObserver.observe(counter);
});

// ======================================
// 5. SMOOTH SCROLL FOR ANCHOR LINKS
// ======================================
/**
 * Enhanced smooth scrolling for navigation links
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        
        // Ignore empty hash links
        if (href === '#' || href === '#!') return;
        
        e.preventDefault();
        
        const target = document.querySelector(href);
        if (target) {
            const navbarHeight = document.getElementById('navbar').offsetHeight;
            const targetPosition = target.offsetTop - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Update URL without scrolling
            history.pushState(null, null, href);
        }
    });
});

// ======================================
// 6. PERFORMANCE OPTIMIZATIONS
// ======================================

/**
 * Lazy load images when they enter viewport
 */
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
lazyLoadImages();

// ======================================
// 7. ACCESSIBILITY ENHANCEMENTS
// ======================================

/**
 * Add keyboard navigation support
 */
document.addEventListener('keydown', function(e) {
    // ESC key closes mobile menu
    if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        toggleMenu();
    }
});

/**
 * Add focus trap for mobile menu
 */
function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled])'
    );
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    element.addEventListener('keydown', function(e) {
        if (e.key !== 'Tab') return;
        
        if (e.shiftKey) {
            if (document.activeElement === firstFocusable) {
                lastFocusable.focus();
                e.preventDefault();
            }
        } else {
            if (document.activeElement === lastFocusable) {
                firstFocusable.focus();
                e.preventDefault();
            }
        }
    });
}

// Apply focus trap to mobile menu when active
navLinks.addEventListener('transitionend', function() {
    if (navLinks.classList.contains('active')) {
        trapFocus(navLinks);
    }
});

// ======================================
// 8. ANALYTICS EVENT TRACKING
// ======================================

/**
 * Track important user interactions
 * Uncomment when Google Analytics is configured
 */
function trackEvent(category, action, label) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }
}

// Track button clicks
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', function() {
        const buttonText = this.textContent.trim();
        // trackEvent('Button', 'Click', buttonText);
    });
});

// Track navigation clicks
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function() {
        const linkText = this.textContent.trim();
        // trackEvent('Navigation', 'Click', linkText);
    });
});

// ======================================
// 9. PAGE LOAD OPTIMIZATIONS
// ======================================

/**
 * Remove loading class when page is fully loaded
 */
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
    
    // Remove any loading overlays
    const loader = document.querySelector('.page-loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 300);
    }
});

/**
 * Detect if user prefers reduced motion
 */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Disable animations for accessibility
    document.querySelectorAll('.hidden').forEach(el => {
        el.classList.remove('hidden');
        el.classList.add('show');
    });
}

// ======================================
// 10. CONSOLE BRANDING
// ======================================
console.log(
    '%c GM CAMPBELL ',
    'background: #E30613; color: #fff; font-size: 20px; font-weight: bold; padding: 10px;'
);
console.log(
    '%c Portfolio Website v2.0 ',
    'background: #111; color: #ccc; font-size: 12px; padding: 5px;'
);
console.log('Interested in the code? Check out the repository!');

// ======================================
// 11. ERROR HANDLING
// ======================================

/**
 * Global error handler
 */
window.addEventListener('error', function(e) {
    console.error('An error occurred:', e.error);
    // Optional: Send error to analytics
    // trackEvent('Error', 'JavaScript Error', e.error.message);
});

/**
 * Handle unhandled promise rejections
 */
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
    // Optional: Send to analytics
    // trackEvent('Error', 'Promise Rejection', e.reason);
});

// Export functions for use in other scripts if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        toggleMenu,
        trackEvent
    };
}
