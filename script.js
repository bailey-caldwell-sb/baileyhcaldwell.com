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
        this.container.innerHTML = '';
    }
}

// Enhanced form handling with validation and feedback
class ContactForm {
    constructor(formSelector) {
        this.form = document.querySelector(formSelector);
        this.submitButton = this.form.querySelector('.submit-button');
        this.originalButtonText = this.submitButton.textContent;
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        this.addRealTimeValidation();
    }

    addRealTimeValidation() {
        const inputs = this.form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(field) {
        const isValid = field.checkValidity();
        field.setAttribute('aria-invalid', !isValid);
        
        if (!isValid) {
            this.showFieldError(field);
        } else {
            this.clearFieldError(field);
        }
        
        return isValid;
    }

    showFieldError(field) {
        field.style.borderColor = '#f44336';
    }

    clearFieldError(field) {
        field.style.borderColor = '';
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        // Validate all fields
        const formData = new FormData(this.form);
        const isValid = this.validateForm();
        
        if (!isValid) {
            this.showMessage('Please fill in all required fields correctly.', 'error');
            return;
        }

        // Show loading state
        this.setLoadingState(true);

        try {
            // Simulate form submission (replace with actual endpoint)
            await this.submitForm(formData);
            
            const name = formData.get('name');
            this.showMessage(`Thank you, ${name}! Your message has been received. I'll get back to you soon.`, 'success');
            this.form.reset();
            
        } catch (error) {
            console.error('Form submission error:', error);
            this.showMessage('Sorry, there was an error sending your message. Please try again later.', 'error');
        } finally {
            this.setLoadingState(false);
        }
    }

    validateForm() {
        const inputs = this.form.querySelectorAll('input[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    async submitForm(formData) {
        // Simulate API call - replace with actual form handling
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate success/failure
                if (Math.random() > 0.1) { // 90% success rate for demo
                    resolve();
                } else {
                    reject(new Error('Network error'));
                }
            }, 1500);
        });
    }

    setLoadingState(isLoading) {
        this.submitButton.disabled = isLoading;
        this.submitButton.textContent = isLoading ? 'Transmitting...' : this.originalButtonText;
        
        if (isLoading) {
            this.submitButton.style.opacity = '0.7';
        } else {
            this.submitButton.style.opacity = '';
        }
    }

    showMessage(text, type) {
        // Remove existing messages
        const existingMessages = this.form.querySelectorAll('.success-message, .error-message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;
        messageDiv.textContent = text;
        messageDiv.style.display = 'block';
        messageDiv.setAttribute('role', 'alert');
        messageDiv.setAttribute('aria-live', 'polite');

        // Insert at the beginning of the form
        this.form.insertBefore(messageDiv, this.form.firstChild);

        // Auto-remove success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 5000);
        }
    }
}

// Enhanced 3D tilt effect with performance optimization
class TiltEffect {
    constructor(elementSelector) {
        this.element = document.querySelector(elementSelector);
        this.isHovering = false;
        this.throttledMouseMove = this.throttle(this.handleMouseMove.bind(this), 16); // ~60fps
        this.init();
    }

    init() {
        if (!this.element) return;

        document.addEventListener('mousemove', this.throttledMouseMove);
        this.element.addEventListener('mouseenter', () => this.isHovering = true);
        this.element.addEventListener('mouseleave', () => {
            this.isHovering = false;
            this.resetTilt();
        });
    }

    handleMouseMove(e) {
        if (!this.isHovering) return;

        const rect = this.element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            this.element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }
    }

    resetTilt() {
        this.element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
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

    destroy() {
        document.removeEventListener('mousemove', this.throttledMouseMove);
    }
}

// Accessibility enhancements
class AccessibilityManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupFocusManagement();
        this.setupScreenReaderSupport();
    }

    setupKeyboardNavigation() {
        // Enhanced keyboard navigation for interactive elements
        const interactiveElements = document.querySelectorAll('button, input, textarea, a[href]');
        
        interactiveElements.forEach((element, index) => {
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    // Custom tab handling if needed
                }
            });
        });
    }

    setupFocusManagement() {
        // Ensure focus is visible and properly managed
        const focusableElements = document.querySelectorAll('button, input, textarea, a[href]');
        
        focusableElements.forEach(element => {
            element.addEventListener('focus', () => {
                element.style.outline = '2px solid var(--primary-blue)';
                element.style.outlineOffset = '2px';
            });
            
            element.addEventListener('blur', () => {
                element.style.outline = '';
                element.style.outlineOffset = '';
            });
        });
    }

    setupScreenReaderSupport() {
        // Add ARIA labels and descriptions where needed
        const form = document.querySelector('.contact-form');
        if (form) {
            form.setAttribute('aria-label', 'Contact form');
        }

        // Add live region for dynamic content
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.style.position = 'absolute';
        liveRegion.style.width = '1px';
        liveRegion.style.height = '1px';
        liveRegion.style.padding = '0';
        liveRegion.style.margin = '-1px';
        liveRegion.style.overflow = 'hidden';
        liveRegion.style.clip = 'rect(0, 0, 0, 0)';
        liveRegion.style.whiteSpace = 'nowrap';
        liveRegion.style.border = '0';
        
        document.body.appendChild(liveRegion);
    }
}

// Performance monitoring
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }

    init() {
        if ('performance' in window) {
            this.measurePageLoad();
            this.setupPerformanceObserver();
        }
    }

    measurePageLoad() {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            this.metrics.pageLoad = perfData.loadEventEnd - perfData.fetchStart;
            console.log(`Page load time: ${this.metrics.pageLoad}ms`);
        });
    }

    setupPerformanceObserver() {
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint') {
                        this.metrics.lcp = entry.startTime;
                        console.log(`LCP: ${this.metrics.lcp}ms`);
                    }
                }
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize star field
    const starField = new StarField('stars', 100);
    
    // Initialize contact form
    const contactForm = new ContactForm('.contact-form');
    
    // Initialize tilt effect (only if user doesn't prefer reduced motion)
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const tiltEffect = new TiltEffect('.main-container');
    }
    
    // Initialize accessibility enhancements
    const accessibilityManager = new AccessibilityManager();
    
    // Initialize performance monitoring (development only)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const performanceMonitor = new PerformanceMonitor();
    }
});

// Handle page visibility changes for performance
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations when page is not visible
        document.body.style.animationPlayState = 'paused';
    } else {
        // Resume animations when page becomes visible
        document.body.style.animationPlayState = 'running';
    }
});

// Export classes for potential testing or external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        StarField,
        ContactForm,
        TiltEffect,
        AccessibilityManager,
        PerformanceMonitor
    };
}
