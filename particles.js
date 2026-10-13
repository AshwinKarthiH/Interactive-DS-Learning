/* ============================================
   ALGOVERSE — Particle System
   Dynamic connecting lines with purple/cyan glow
   Mouse interaction & click ripple physics
   ============================================ */

(function () {
    'use strict';

    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // --- Configuration ---
    const CONFIG = {
        particleCount: 120,
        particleMinRadius: 1.5,
        particleMaxRadius: 4,
        particleSpeed: 0.4,
        connectionDistance: 160,
        mouseConnectionDistance: 200,
        mouseForceRadius: 180,
        mouseForceStrength: 0.02,
        rippleForce: 8,
        rippleRadius: 200,
        lineMaxOpacity: 0.35,
        mouseLineMaxOpacity: 0.55,
        colors: {
            particlePurple: { r: 168, g: 85, b: 247 },
            particleCyan: { r: 6, g: 182, b: 212 },
            particlePink: { r: 236, g: 72, b: 153 },
            linePurple: { r: 139, g: 92, b: 246 },
            lineCyan: { r: 34, g: 211, b: 238 },
        },
        glowSize: 15,
        damping: 0.98,
        returnForce: 0.005,
    };

    // --- State ---
    let particles = [];
    let mouse = { x: -1000, y: -1000, active: false };
    let ripples = [];
    let animationId;
    let dpr = window.devicePixelRatio || 1;

    // --- Canvas Setup ---
    function resizeCanvas() {
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // --- Particle Class ---
    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            const w = canvas.width / dpr;
            const h = canvas.height / dpr;
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.originX = this.x;
            this.originY = this.y;
            this.vx = (Math.random() - 0.5) * CONFIG.particleSpeed * 2;
            this.vy = (Math.random() - 0.5) * CONFIG.particleSpeed * 2;
            this.radius = CONFIG.particleMinRadius + Math.random() * (CONFIG.particleMaxRadius - CONFIG.particleMinRadius);
            this.baseRadius = this.radius;

            // Color: weighted random between purple, cyan, pink
            const rnd = Math.random();
            if (rnd < 0.45) {
                this.color = { ...CONFIG.colors.particlePurple };
            } else if (rnd < 0.85) {
                this.color = { ...CONFIG.colors.particleCyan };
            } else {
                this.color = { ...CONFIG.colors.particlePink };
            }

            this.opacity = 0.3 + Math.random() * 0.5;
            this.baseOpacity = this.opacity;
            this.pulseSpeed = 0.005 + Math.random() * 0.015;
            this.pulsePhase = Math.random() * Math.PI * 2;
        }

        update(time) {
            const w = canvas.width / dpr;
            const h = canvas.height / dpr;

            // Pulse effect
            const pulse = Math.sin(time * this.pulseSpeed + this.pulsePhase);
            this.opacity = this.baseOpacity + pulse * 0.15;
            this.radius = this.baseRadius + pulse * 0.5;

            // Mouse attraction/repulsion
            if (mouse.active) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONFIG.mouseForceRadius && dist > 0) {
                    const force = (CONFIG.mouseForceRadius - dist) / CONFIG.mouseForceRadius;
                    this.vx += (dx / dist) * force * CONFIG.mouseForceStrength;
                    this.vy += (dy / dist) * force * CONFIG.mouseForceStrength;
                }
            }

            // Apply velocity
            this.x += this.vx;
            this.y += this.vy;

            // Gentle return to origin
            this.vx += (this.originX - this.x) * CONFIG.returnForce;
            this.vy += (this.originY - this.y) * CONFIG.returnForce;

            // Damping
            this.vx *= CONFIG.damping;
            this.vy *= CONFIG.damping;

            // Boundary wrapping
            if (this.x < -20) this.x = w + 20;
            if (this.x > w + 20) this.x = -20;
            if (this.y < -20) this.y = h + 20;
            if (this.y > h + 20) this.y = -20;
        }

        draw() {
            // Glow effect
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.radius * CONFIG.glowSize
            );
            gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity * 0.3})`);
            gradient.addColorStop(0.3, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity * 0.1})`);
            gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * CONFIG.glowSize, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Core particle
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.opacity})`;
            ctx.fill();

            // Bright center
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.6})`;
            ctx.fill();
        }
    }

    // --- Ripple Class ---
    class Ripple {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.radius = 0;
            this.maxRadius = CONFIG.rippleRadius;
            this.opacity = 0.6;
            this.speed = 5;
            this.alive = true;
        }

        update() {
            this.radius += this.speed;
            this.opacity -= 0.012;
            if (this.opacity <= 0 || this.radius > this.maxRadius) {
                this.alive = false;
            }
        }

        draw() {
            if (!this.alive) return;
            // Purple ring
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(168, 85, 247, ${this.opacity * 0.5})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Cyan ring (slightly behind)
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * 0.85, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(6, 182, 212, ${this.opacity * 0.3})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        pushParticles() {
            particles.forEach(p => {
                const dx = p.x - this.x;
                const dy = p.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.maxRadius && dist > 0) {
                    const force = (1 - dist / this.maxRadius) * CONFIG.rippleForce;
                    p.vx += (dx / dist) * force;
                    p.vy += (dy / dist) * force;
                }
            });
        }
    }

    // --- Drawing Connections ---
    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            // Particle-to-particle connections
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONFIG.connectionDistance) {
                    const opacity = (1 - dist / CONFIG.connectionDistance) * CONFIG.lineMaxOpacity;

                    // Gradient line between particles
                    const gradient = ctx.createLinearGradient(
                        particles[i].x, particles[i].y,
                        particles[j].x, particles[j].y
                    );

                    const ci = particles[i].color;
                    const cj = particles[j].color;

                    gradient.addColorStop(0, `rgba(${ci.r}, ${ci.g}, ${ci.b}, ${opacity})`);
                    gradient.addColorStop(1, `rgba(${cj.r}, ${cj.g}, ${cj.b}, ${opacity})`);

                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }

            // Particle-to-mouse connections
            if (mouse.active) {
                const dx = particles[i].x - mouse.x;
                const dy = particles[i].y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < CONFIG.mouseConnectionDistance) {
                    const opacity = (1 - dist / CONFIG.mouseConnectionDistance) * CONFIG.mouseLineMaxOpacity;

                    const gradient = ctx.createLinearGradient(
                        particles[i].x, particles[i].y,
                        mouse.x, mouse.y
                    );

                    const ci = particles[i].color;
                    gradient.addColorStop(0, `rgba(${ci.r}, ${ci.g}, ${ci.b}, ${opacity})`);
                    gradient.addColorStop(0.5, `rgba(168, 85, 247, ${opacity * 0.8})`);
                    gradient.addColorStop(1, `rgba(6, 182, 212, ${opacity})`);

                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = 1.2;
                    ctx.stroke();

                    // Glow effect on the line
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.strokeStyle = `rgba(168, 85, 247, ${opacity * 0.15})`;
                    ctx.lineWidth = 4;
                    ctx.stroke();
                }
            }
        }
    }

    // --- Draw mouse cursor glow ---
    function drawMouseGlow() {
        if (!mouse.active) return;

        const gradient = ctx.createRadialGradient(
            mouse.x, mouse.y, 0,
            mouse.x, mouse.y, 100
        );
        gradient.addColorStop(0, 'rgba(168, 85, 247, 0.08)');
        gradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.03)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 100, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    // --- Init Particles ---
    function initParticles() {
        particles = [];
        // Scale particle count based on screen size
        const area = (canvas.width / dpr) * (canvas.height / dpr);
        const count = Math.min(CONFIG.particleCount, Math.floor(area / 8000));
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    // --- Animation Loop ---
    let time = 0;
    function animate() {
        time++;
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;

        ctx.clearRect(0, 0, w, h);

        // Background subtle gradient
        const bgGradient = ctx.createRadialGradient(w * 0.3, h * 0.3, 0, w * 0.5, h * 0.5, w * 0.8);
        bgGradient.addColorStop(0, 'rgba(168, 85, 247, 0.015)');
        bgGradient.addColorStop(0.5, 'rgba(6, 182, 212, 0.008)');
        bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, w, h);

        // Update & draw ripples
        ripples = ripples.filter(r => r.alive);
        ripples.forEach(r => {
            r.update();
            r.draw();
        });

        // Update particles
        particles.forEach(p => p.update(time));

        // Draw connections
        drawConnections();

        // Draw mouse glow
        drawMouseGlow();

        // Draw particles
        particles.forEach(p => p.draw());

        animationId = requestAnimationFrame(animate);
    }

    // --- Event Listeners ---
    function handleMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.active = true;
    }

    function handleMouseLeave() {
        mouse.active = false;
    }

    function handleClick(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Create particle ripple
        const ripple = new Ripple(x, y);
        ripple.pushParticles();
        ripples.push(ripple);

        // Create DOM ripple effect
        const clickRipple = document.getElementById('clickRipple');
        if (clickRipple) {
            clickRipple.style.left = e.clientX + 'px';
            clickRipple.style.top = e.clientY + 'px';
            clickRipple.classList.remove('active');
            void clickRipple.offsetWidth; // Force reflow
            clickRipple.classList.add('active');
        }
    }

    function handleTouchMove(e) {
        if (e.touches.length > 0) {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.touches[0].clientX - rect.left;
            mouse.y = e.touches[0].clientY - rect.top;
            mouse.active = true;
        }
    }

    function handleTouchEnd() {
        mouse.active = false;
    }

    // --- Initialize ---
    function init() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        resizeCanvas();
        initParticles();
        animate();

        // Make canvas interactive
        document.body.classList.add('particles-interactive');

        // Bind events to document for full-page interaction
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('click', handleClick);
        document.addEventListener('touchmove', handleTouchMove, { passive: true });
        document.addEventListener('touchend', handleTouchEnd);

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                resizeCanvas();
                initParticles();
            }, 200);
        });
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for other scripts
    window.ParticleSystem = {
        addRipple: (x, y) => {
            const ripple = new Ripple(x, y);
            ripple.pushParticles();
            ripples.push(ripple);
        },
        getParticles: () => particles,
    };
})();
