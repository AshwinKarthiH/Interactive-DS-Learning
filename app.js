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
    const authForm = document.getElementById('authForm');
    const codeHighlight = document.getElementById('codeHighlight');

    let currentRole = 'student';

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
            mobileMenuBtn.setAttribute('aria-expanded', mobileMenu.classList.contains('active'));
        });

        // Close mobile menu on link click
        mobileMenu.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
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

    // Public demo profile selection, not account authentication.
    if (authForm && !AlgoAPI.enabled) authForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const name = document.getElementById('nameInput').value.trim() || 'Guest';
        AlgoStore.write('algoverse_user', {name, role:currentRole, demo:true});
        window.location.href = currentRole === 'admin' ? 'admin.html' : 'dashboard.html';
    });

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
                demo: true,
                timestamp: Date.now()
            };
            AlgoStore.write('algoverse_user', {...studentData, demo:true});
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
                demo: true,
                timestamp: Date.now()
            };
            AlgoStore.write('algoverse_user', {...adminData, demo:true});
            window.location.href = 'admin.html';
        });
    }

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
