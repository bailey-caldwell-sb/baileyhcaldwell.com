/**
 * Bailey H. Caldwell Consulting Website - Interactive Elements
 * Space-themed professional website with glassmorphism design
 * 
 * Features:
 * - Animated starfield background
 * - Smooth scroll navigation
 * - Performance optimized animations
 * - Accessibility improvements
 */

// Performance optimized star creation and animation
class StarField {
    constructor(containerId, starCount = 100) {
        this.container = document.getElementById(containerId);
        this.starCount = starCount;
        this.stars = [];
        this.animationId = null;
        this.init();
    }

    init() {
        if (!this.container) return;
        this.createStars();
        this.startAnimation();
    }

    createStars() {
        // Use document fragment for better performance
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < this.starCount; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            
            const size = Math.random() * 3 + 1;
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 3}s`;
            star.style.animationDuration = `${Math.random() * 3 + 2}s`;
            
            fragment.appendChild(star);
            this.stars.push(star);
        }
        
        this.container.appendChild(fragment);
    }

    startAnimation() {
        // Reduced motion check
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }
        
        this.animateStars();
    }

    animateStars() {
        // Optional: Add subtle movement to stars
        this.animationId = requestAnimationFrame(() => this.animateStars());
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Smooth scroll navigation
class SmoothNavigation {
    constructor() {
        this.init();
    }

    init() {
        // Add smooth scroll behavior to navigation links
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavClick(e));
        });

        // Update active navigation based on scroll position
        this.updateActiveNav();
        window.addEventListener('scroll', () => this.throttle(this.updateActiveNav.bind(this), 100));
    }

    handleNavClick(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        
        if (targetElement) {
            const headerOffset = 80; // Account for fixed header
            const elementPosition = targetElement.offsetTop;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });

            // Update focus for accessibility
            targetElement.focus({ preventScroll: true });
        }
    }

    updateActiveNav() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
}

// Performance monitoring and optimization
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        // Lazy load images when they come into view
        this.setupLazyLoading();
        
        // Optimize animations based on device capabilities
        this.optimizeAnimations();
        
        // Monitor performance
        this.monitorPerformance();
    }

    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        observer.unobserve(img);
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    optimizeAnimations() {
        // Reduce animations on low-end devices
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        
        if (connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
            document.body.classList.add('reduced-animations');
        }

        // Respect user's motion preferences
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
        }
    }

    monitorPerformance() {
        // Monitor Core Web Vitals
        if ('web-vital' in window) {
            // This would integrate with web-vitals library if included
            // For now, just basic performance monitoring
        }

        // Basic performance logging
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            if (perfData) {
                console.log(`Page load time: ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
            }
        });
    }
}

// Accessibility enhancements
class AccessibilityEnhancer {
    constructor() {
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupARIALabels();
    }

    setupKeyboardNavigation() {
        // Enhanced keyboard navigation for cards
        const cards = document.querySelectorAll('.service-card, .analysis-card');
        cards.forEach(card => {
            card.setAttribute('tabindex', '0');
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    const link = card.querySelector('a');
                    if (link) {
                        e.preventDefault();
                        link.click();
                    }
                }
            });
        });
    }

    setupFocusManagement() {
        // Ensure focus is visible and properly managed
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.body.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.body.classList.remove('keyboard-navigation');
        });
    }

    setupARIALabels() {
        // Add ARIA labels where needed
        const cards = document.querySelectorAll('.service-card, .analysis-card');
        cards.forEach((card, index) => {
            const title = card.querySelector('h3');
            if (title && !card.getAttribute('aria-label')) {
                card.setAttribute('aria-label', `Service: ${title.textContent}`);
            }
        });
    }
}

// Main application initialization
class WebsiteApp {
    constructor() {
        this.components = {};
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        try {
            // Initialize all components
            this.components.starField = new StarField('stars', 80);
            this.components.navigation = new SmoothNavigation();
            this.components.performance = new PerformanceOptimizer();
            this.components.accessibility = new AccessibilityEnhancer();

            console.log('Website components initialized successfully');
        } catch (error) {
            console.error('Error initializing website components:', error);
        }
    }

    destroy() {
        // Clean up components
        Object.values(this.components).forEach(component => {
            if (component && typeof component.destroy === 'function') {
                component.destroy();
            }
        });
    }
}

// Initialize the application
const app = new WebsiteApp();

// Handle page visibility changes for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when page is not visible
        if (app.components.starField) {
            app.components.starField.destroy();
        }
    } else {
        // Resume animations when page becomes visible
        if (app.components.starField) {
            app.components.starField = new StarField('stars', 80);
        }
    }
});

// Export for potential module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WebsiteApp, StarField, SmoothNavigation };
}
