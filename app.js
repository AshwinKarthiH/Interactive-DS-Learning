/* ============================================
   ALGOVERSE — Landing Page Application Logic
   Auth, navigation, scroll effects, animations
   ============================================ */

(function () {
    'use strict';

    // --- DOM Elements ---
    const navbar = document.getElementById('navbar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const studentTab = document.getElementById('studentTab');
    const adminTab = document.getElementById('adminTab');
    const loginModeTab = document.getElementById('loginModeTab');
    const signupModeTab = document.getElementById('signupModeTab');
    const nameGroup = document.getElementById('nameGroup');
    const authForm = document.getElementById('authForm');
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('passwordInput');
    const authSubmitText = document.getElementById('authSubmitText');
    const codeHighlight = document.getElementById('codeHighlight');

    let currentRole = 'student';
    let currentMode = 'login';

    // --- Navbar Scroll Effect ---
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (navbar) {
            navbar.classList.toggle('scrolled', scrollY > 50);
        }
        lastScroll = scrollY;
    });

    // --- Mobile Menu ---
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });

        // Close mobile menu on link click
        mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });
    }

    // --- Auth Tabs (Student/Admin) ---
    function setRoleTab(role) {
        currentRole = role;
        document.querySelectorAll('.auth-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === role);
        });
    }

    if (studentTab) studentTab.addEventListener('click', () => setRoleTab('student'));
    if (adminTab) adminTab.addEventListener('click', () => setRoleTab('admin'));

    // --- Auth Mode Tabs (Login/Signup) ---
    function setModeTab(mode) {
        currentMode = mode;
        document.querySelectorAll('.mode-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.mode === mode);
        });
        if (nameGroup) {
            nameGroup.style.display = mode === 'signup' ? 'block' : 'none';
        }
        if (authSubmitText) {
            authSubmitText.textContent = mode === 'login' ? "Let's get learning" : "Create my account";
        }
    }

    if (loginModeTab) loginModeTab.addEventListener('click', () => setModeTab('login'));
    if (signupModeTab) signupModeTab.addEventListener('click', () => setModeTab('signup'));

    // --- Password Toggle ---
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            passwordToggle.innerHTML = isPassword
                ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                   </svg>`
                : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                   </svg>`;
        });
    }

    // --- Auth Form Submit ---
    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('emailInput')?.value;
            const password = passwordInput?.value;
            const name = document.getElementById('nameInput')?.value;

            // Store user data (demo — localStorage)
            const userData = {
                email,
                role: currentRole,
                name: name || email?.split('@')[0] || 'User',
                loggedIn: true,
                timestamp: Date.now(),
            };
            localStorage.setItem('algoverse_user', JSON.stringify(userData));

            // Redirect based on role
            const submitBtn = document.getElementById('authSubmit');
            if (submitBtn) {
                submitBtn.innerHTML = `
                    <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10" stroke-dasharray="30 60"/>
                    </svg>
                    <span>Getting ready...</span>
                `;
                submitBtn.style.pointerEvents = 'none';
            }

            setTimeout(() => {
                if (currentRole === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'dashboard.html';
                }
            }, 1200);
        });
    }

    // --- Code Highlight Animation ---
    if (codeHighlight) {
        const lineHeight = 26;
        const startTop = 72;
        const totalLines = 13;
        let currentLine = 0;

        setInterval(() => {
            currentLine = (currentLine + 1) % totalLines;
            codeHighlight.style.top = (startTop + currentLine * lineHeight) + 'px';
        }, 1500);
    }

    // --- Scroll Reveal ---
    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.feature-card, .topic-card, .about-content, .stats-row');
        revealElements.forEach(el => el.classList.add('reveal'));

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        revealElements.forEach(el => observer.observe(el));
    }

    // --- Counter Animation ---
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const text = el.textContent;
                    const num = parseInt(text.replace(/\D/g, ''));
                    const suffix = text.replace(/[\d]/g, '');
                    let current = 0;
                    const step = num / 40;
                    const interval = setInterval(() => {
                        current += step;
                        if (current >= num) {
                            el.textContent = text;
                            clearInterval(interval);
                        } else {
                            el.textContent = Math.floor(current) + suffix;
                        }
                    }, 30);
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(c => observer.observe(c));
    }

    // --- Smooth Scroll for Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // --- Quick Demo Logins (Student & Admin) ---
    const demoStudentBtn = document.getElementById('demoStudentLogin');
    if (demoStudentBtn) {
        demoStudentBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const studentData = {
                email: 'nikitha@student.algoverse.io',
                role: 'student',
                name: 'Nikitha',
                loggedIn: true,
                timestamp: Date.now()
            };
            localStorage.setItem('algoverse_user', JSON.stringify(studentData));
            window.location.href = 'dashboard.html';
        });
    }

    const demoAdminBtn = document.getElementById('demoAdminLogin');
    if (demoAdminBtn) {
        demoAdminBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const adminData = {
                email: 'dr.abc@algoverse.io',
                role: 'admin',
                name: 'Dr. ABC',
                loggedIn: true,
                timestamp: Date.now()
            };
            localStorage.setItem('algoverse_user', JSON.stringify(adminData));
            window.location.href = 'admin.html';
        });
    }

    // --- Social Auth Buttons (Demo) ---
    ['googleAuth', 'githubAuth', 'discordAuth'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => {
                const userData = {
                    email: 'demo@algoverse.io',
                    role: 'student',
                    name: 'Demo User',
                    loggedIn: true,
                    timestamp: Date.now(),
                };
                localStorage.setItem('algoverse_user', JSON.stringify(userData));
                window.location.href = 'dashboard.html';
            });
        }
    });

    // --- Initialize ---
    function init() {
        initScrollReveal();
        animateCounters();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Add spinner animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinner { animation: spin 1s linear infinite; }
    `;
    document.head.appendChild(style);
})();
