// ===================================
// MODERN JAVASCRIPT FOR LANDING PAGE
// ===================================

// Wait for DOM to be fully loaded before running scripts
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all features
    initMobileMenu();
    initSmoothScrolling();
    initScrollAnimations();
    initNavbarScroll();
});

// ===================================
// MOBILE MENU TOGGLE
// ===================================
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-menu a');

    // Toggle menu on hamburger click
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');

        // Prevent body scroll when menu is open
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when a link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// ===================================
// SMOOTH SCROLLING TO SECTIONS
// ===================================
function initSmoothScrolling() {
    // Select all links that start with #
    const scrollLinks = document.querySelectorAll('a[href^="#"]');

    scrollLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Get the target section
            const targetId = link.getAttribute('href');

            // Skip if it's just "#"
            if (targetId === '#') return;

            e.preventDefault();

            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                // Calculate offset for fixed navbar
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetSection.offsetTop - navbarHeight;

                // Smooth scroll to target
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===================================
// SCROLL ANIMATIONS (Intersection Observer)
// ===================================
function initScrollAnimations() {
    // Elements to animate on scroll
    const animateOnScroll = document.querySelectorAll('.service-card, .portfolio-item');

    // Check if Intersection Observer is supported
    if ('IntersectionObserver' in window) {
        // Create observer
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add animation class when element enters viewport
                    entry.target.style.opacity = '0';
                    entry.target.style.transform = 'translateY(30px)';

                    // Trigger animation
                    setTimeout(() => {
                        entry.target.style.transition = 'all 0.6s ease-out';
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, 100);

                    // Stop observing after animation
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1, // Trigger when 10% of element is visible
            rootMargin: '0px 0px -50px 0px' // Start slightly before element enters viewport
        });

        // Observe all elements
        animateOnScroll.forEach(element => {
            observer.observe(element);
        });
    } else {
        // Fallback for browsers without Intersection Observer
        animateOnScroll.forEach(element => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    }
}

// ===================================
// NAVBAR BACKGROUND ON SCROLL
// ===================================
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Add shadow when scrolled down
        if (currentScroll > 100) {
            navbar.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
        }

        lastScroll = currentScroll;
    });
}

// ===================================
// PORTFOLIO LIGHTBOX (Optional Enhancement)
// ===================================
function initPortfolioLightbox() {
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    portfolioItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Get image source
            const img = item.querySelector('.portfolio-image img');
            const title = item.querySelector('.portfolio-content h3').textContent;
            const description = item.querySelector('.portfolio-content > p').textContent;

            // Create lightbox
            createLightbox(img.src, title, description);
        });
    });
}

function createLightbox(imageSrc, title, description) {
    // Create lightbox elements
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close">&times;</button>
            <img src="${imageSrc}" alt="${title}">
            <div class="lightbox-info">
                <h3>${title}</h3>
                <p>${description}</p>
            </div>
        </div>
    `;

    // Add styles
    lightbox.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        padding: 2rem;
        animation: fadeIn 0.3s ease-out;
    `;

    // Add to page
    document.body.appendChild(lightbox);
    document.body.style.overflow = 'hidden';

    // Close handlers
    const closeBtn = lightbox.querySelector('.lightbox-close');
    closeBtn.addEventListener('click', () => closeLightbox(lightbox));
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            closeLightbox(lightbox);
        }
    });
}

function closeLightbox(lightbox) {
    lightbox.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
        lightbox.remove();
        document.body.style.overflow = '';
    }, 300);
}

// ===================================
// FORM VALIDATION (If you add a contact form)
// ===================================
function initFormValidation() {
    const form = document.querySelector('#contact-form');

    if (!form) return; // Exit if no form exists

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form fields
        const name = form.querySelector('#name').value.trim();
        const email = form.querySelector('#email').value.trim();
        const message = form.querySelector('#message').value.trim();

        // Basic validation
        let errors = [];

        if (name.length < 2) {
            errors.push('Name must be at least 2 characters');
        }

        if (!isValidEmail(email)) {
            errors.push('Please enter a valid email address');
        }

        if (message.length < 10) {
            errors.push('Message must be at least 10 characters');
        }

        // Display errors or submit
        if (errors.length > 0) {
            showFormErrors(errors);
        } else {
            // Submit form (connect to your API here)
            submitForm({ name, email, message });
        }
    });
}

function isValidEmail(email) {
    // Simple email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showFormErrors(errors) {
    // Create error display
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-errors';
    errorDiv.innerHTML = `
        <h4>Please fix the following errors:</h4>
        <ul>${errors.map(error => `<li>${error}</li>`).join('')}</ul>
    `;
    errorDiv.style.cssText = `
        background-color: #fee;
        border: 1px solid #fcc;
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 0.5rem;
        color: #c00;
    `;

    // Remove existing errors
    const existingErrors = document.querySelector('.form-errors');
    if (existingErrors) existingErrors.remove();

    // Add to form
    const form = document.querySelector('#contact-form');
    form.insertBefore(errorDiv, form.firstChild);
}

function submitForm(data) {
    // This is where you'd connect to your Flask API
    console.log('Form submitted:', data);

    // Show success message
    const successDiv = document.createElement('div');
    successDiv.className = 'form-success';
    successDiv.innerHTML = '<p>Thank you! We\'ll be in touch soon.</p>';
    successDiv.style.cssText = `
        background-color: #efe;
        border: 1px solid #cfc;
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 0.5rem;
        color: #060;
    `;

    const form = document.querySelector('#contact-form');
    form.insertBefore(successDiv, form.firstChild);
    form.reset();

    // Example API call (uncomment and modify when ready):
    /*
    fetch('/api/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        console.log('Success:', result);
    })
    .catch(error => {
        console.error('Error:', error);
    });
    */
}

// ===================================
// PERFORMANCE: LAZY LOAD IMAGES
// ===================================
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
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
    } else {
        // Fallback: load all images immediately
        images.forEach(img => {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
        });
    }
}

// ===================================
// UTILITY: DEBOUNCE FUNCTION
// ===================================
// Useful for optimizing scroll and resize events
function debounce(func, wait = 20) {
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

// Example usage:
// window.addEventListener('scroll', debounce(() => {
//     console.log('Scrolled!');
// }, 100));

// ===================================
// CONSOLE MESSAGE (Professional Touch)
// ===================================
console.log(
    '%c🔒 SecureAccess Pro',
    'font-size: 20px; font-weight: bold; color: #1e40af;'
);
console.log(
    '%cInterested in our tech stack? Visit our careers page!',
    'font-size: 12px; color: #64748b;'
);
