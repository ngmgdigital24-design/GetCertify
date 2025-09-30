// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            
            // Animate hamburger menu
            const bars = navToggle.querySelectorAll('.bar');
            bars.forEach((bar, index) => {
                if (navMenu.classList.contains('active')) {
                    if (index === 0) bar.style.transform = 'rotate(45deg) translate(5px, 5px)';
                    if (index === 1) bar.style.opacity = '0';
                    if (index === 2) bar.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                } else {
                    bar.style.transform = 'none';
                    bar.style.opacity = '1';
                }
            });
        });

        // Close mobile menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                bars.forEach(bar => {
                    bar.style.transform = 'none';
                    bar.style.opacity = '1';
                });
            });
        });
    }

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Form Handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const whatsappButton = document.getElementById('whatsappButton');
    // SMS button removed
    const googleFormButton = document.getElementById('googleFormButton');
    // Optional: set this to your Google Sheets responses URL to show a quick link after submit
    const GOOGLE_SHEET_RESPONSES_URL = '';
    // Sanitize phone input to digits only as user types
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', () => {
            const digits = (phoneInput.value || '').replace(/\D/g, '');
            phoneInput.value = digits;
        });
    }
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Basic validation
            if (!data.name || !data.email || !data.phone) {
                showNotification('Please fill in all required fields (Name, Email, Phone).', 'error');
                return;
            }
            
            if (!isValidEmail(data.email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            if (!isValidPhone(data.phone)) {
                showNotification('Please enter a valid phone number (digits only, min 10).', 'error');
                return;
            }
            
            // Submit to Google Forms
            const googleFormAction = 'https://docs.google.com/forms/d/e/1FAIpQLSeyh5zZfOWBEB9XyoAG5frEWYNAPJEh8ah4-oeFgF_VfLlP8Q/formResponse';
            // Map fields to Google Form entry IDs (already set below)
            const ENTRY_NAME = 'entry.2005620554';
            const ENTRY_EMAIL = 'entry.1045781291';
            const ENTRY_PHONE = 'entry.1166974658';
            const ENTRY_CERT = 'entry.1065046570';
            const ENTRY_MESSAGE = '';

            // Submit via hidden form + iframe (more reliable with Google Forms)
            let sinkIframe = document.getElementById('gf_sink_iframe');
            if (!sinkIframe) {
                sinkIframe = document.createElement('iframe');
                sinkIframe.style.display = 'none';
                sinkIframe.name = 'gf_sink_iframe';
                sinkIframe.id = 'gf_sink_iframe';
                document.body.appendChild(sinkIframe);
            }

            const tempForm = document.createElement('form');
            tempForm.action = googleFormAction;
            tempForm.method = 'POST';
            tempForm.target = 'gf_sink_iframe';
            tempForm.style.display = 'none';

            const addField = (name, value) => {
                if (value == null || value === '') return;
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = name;
                input.value = value;
                tempForm.appendChild(input);
            };

            addField(ENTRY_NAME, data.name);
            addField(ENTRY_EMAIL, data.email);
            addField(ENTRY_PHONE, data.phone);
            addField(ENTRY_CERT, data.certification || '');
            if (ENTRY_MESSAGE) addField(ENTRY_MESSAGE, data.message || '');

            document.body.appendChild(tempForm);
            try {
                tempForm.submit();
            } finally {
                setTimeout(() => tempForm.remove(), 1000);
            }

            let successMsg = 'Thanks! Your details have been submitted.';
            if (GOOGLE_SHEET_RESPONSES_URL) {
                successMsg += ` <a href="${GOOGLE_SHEET_RESPONSES_URL}" target="_blank" rel="noopener" style="text-decoration:underline; color:#fff;">View your submission</a>`;
            }
            showNotification(successMsg, 'success');
            this.reset();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // WhatsApp integration
    if (whatsappButton && contactForm) {
        whatsappButton.addEventListener('click', function() {
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);

            // Basic validation (same as form)
            if (!data.name || !data.email || !data.phone) {
                showNotification('Please fill in Name, Email, and Phone before WhatsApp.', 'error');
                return;
            }
            if (!isValidEmail(data.email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            if (!isValidPhone(data.phone)) {
                showNotification('Please enter a valid phone number (digits only, min 10).', 'error');
                return;
            }

            const phone = (data.phone || '').trim();
            const experience = undefined;
            const timeline = undefined;
            const budget = undefined;
            const message = (data.message || '').trim();

            const targetNumber = '918247014778';
            const lines = [
                `New enquiry from GetYourCert`,
                `Name: ${data.name}`,
                `Email: ${data.email}`,
                `Phone: ${phone}`,
                data.certification ? `Certification: ${data.certification}` : null,
                // Experience/Timeline/Budget removed from form
                message ? `Message: ${message}` : null
            ].filter(Boolean);

            const waText = encodeURIComponent(lines.join('\n'));
            const waUrl = `https://wa.me/${targetNumber}?text=${waText}`;

            window.open(waUrl, '_blank');
        });
    }

    // SMS integration removed

    // Open prefilled Google Form as fallback/verification
    if (googleFormButton && contactForm) {
        googleFormButton.addEventListener('click', function() {
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);

            if (!data.name || !data.email || !data.phone) {
                showNotification('Please fill in Name, Email, and Phone first.', 'error');
                return;
            }
            if (!isValidEmail(data.email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            if (!isValidPhone(data.phone)) {
                showNotification('Please enter a valid phone number (digits only, min 10).', 'error');
                return;
            }

            const base = 'https://docs.google.com/forms/d/e/1FAIpQLSeyh5zZfOWBEB9XyoAG5frEWYNAPJEh8ah4-oeFgF_VfLlP8Q/viewform?usp=pp_url';
            const params = new URLSearchParams();
            params.set('entry.2005620554', data.name);
            params.set('entry.1045781291', data.email);
            params.set('entry.1166974658', data.phone);
            if (data.certification) params.set('entry.1065046570', data.certification);
            // No comments entry provided in this form

            const url = `${base}&${params.toString()}`;
            window.open(url, '_blank', 'noopener');
        });
    }
});

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone validation (digits only, at least 10 digits)
function isValidPhone(phone) {
    const digitsOnly = (phone || '').replace(/\D/g, '');
    return /^\d{10,}$/.test(digitsOnly);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#4F46E5'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// FAQ Accordion
document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = question.querySelector('i');
        
        // Initially hide all answers
        answer.style.display = 'none';
        
        question.addEventListener('click', function() {
            const isOpen = answer.style.display === 'block';
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    const otherIcon = otherItem.querySelector('.faq-question i');
                    otherAnswer.style.display = 'none';
                    otherIcon.style.transform = 'rotate(0deg)';
                }
            });
            
            // Toggle current item
            if (isOpen) {
                answer.style.display = 'none';
                icon.style.transform = 'rotate(0deg)';
            } else {
                answer.style.display = 'block';
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });
});

// Certification Category Tabs
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const certSections = document.querySelectorAll('.cert-section');
    
    if (tabButtons.length > 0 && certSections.length > 0) {
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const category = this.getAttribute('data-category');
                
                // Update active tab
                tabButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Show/hide sections
                if (category === 'all') {
                    certSections.forEach(section => {
                        section.style.display = 'block';
                        section.classList.add('fade-in-up');
                    });
                } else {
                    certSections.forEach(section => {
                        if (section.id === category) {
                            section.style.display = 'block';
                            section.classList.add('fade-in-up');
                        } else {
                            section.style.display = 'none';
                        }
                    });
                }
            });
        });
    }
});

// Smooth reveal animations on scroll
document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animateElements = document.querySelectorAll('.cert-item, .feature-item, .testimonial-card, .story-card, .video-card, .material-card, .support-card, .package-card');
    animateElements.forEach(el => {
        observer.observe(el);
    });
});

// Counter animation for stats
document.addEventListener('DOMContentLoaded', function() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const animateCounter = (element, target, duration = 2000) => {
        let start = 0;
        const increment = target / (duration / 16);
        
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                element.textContent = target.toLocaleString();
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(start).toLocaleString();
            }
        }, 16);
    };
    
    // Intersection Observer for stats
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumber = entry.target;
                const text = statNumber.textContent;
                
                // Extract number from text (remove +, %, $, etc.)
                const number = parseInt(text.replace(/[^\d]/g, ''));
                if (number) {
                    animateCounter(statNumber, number);
                }
                
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => {
        statsObserver.observe(stat);
    });
});

// Mobile menu close on outside click
document.addEventListener('click', function(e) {
    const navMenu = document.getElementById('nav-menu');
    const navToggle = document.getElementById('nav-toggle');
    
    if (navMenu && navMenu.classList.contains('active')) {
        if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
            navMenu.classList.remove('active');
            
            // Reset hamburger menu
            const bars = navToggle.querySelectorAll('.bar');
            bars.forEach(bar => {
                bar.style.transform = 'none';
                bar.style.opacity = '1';
            });
        }
    }
});

// Parallax effect for hero section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    
    if (hero) {
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Add loading states to forms
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = this.querySelector('button[type="submit"]');
            if (submitBtn) {
                const originalText = submitBtn.innerHTML;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                submitBtn.disabled = true;
                
                // Re-enable button after a delay (simulating form submission)
                setTimeout(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 3000);
            }
        });
    });
});

// Video thumbnail click handler
document.addEventListener('DOMContentLoaded', function() {
    const videoThumbnails = document.querySelectorAll('.video-thumbnail');
    
    videoThumbnails.forEach(thumbnail => {
        thumbnail.addEventListener('click', function() {
            // In a real implementation, this would open a video modal or redirect to video
            showNotification('Video player coming soon!', 'info');
        });
    });
});

// Lead magnet download handler
document.addEventListener('DOMContentLoaded', function() {
    const downloadBtn = document.querySelector('.lead-magnet .btn');
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Simulate download
            showNotification('Download started! Check your email for the guide.', 'success');
            
            // In a real implementation, this would trigger an actual download
            // and potentially capture email for lead generation
        });
    }
});

// Add CSS for notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        line-height: 1;
    }
    
    .notification-close:hover {
        opacity: 0.8;
    }
    
    .notification-message {
        flex: 1;
    }
`;

document.head.appendChild(notificationStyles);

// Performance optimization: Lazy load images
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});

// Add smooth scrolling polyfill for older browsers
if (!('scrollBehavior' in document.documentElement.style)) {
    const smoothScrollPolyfill = document.createElement('script');
    smoothScrollPolyfill.src = 'https://cdn.jsdelivr.net/npm/smoothscroll-polyfill@0.4.4/dist/smoothscroll.min.js';
    document.head.appendChild(smoothScrollPolyfill);
}
