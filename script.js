/* =========================================
   1. SETUP & CONFIGURATION
   ========================================= */
gsap.registerPlugin(ScrollTrigger);

// Initialize Lenis Smooth Scroll
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
    mouseMultiplier: 1,
    touchMultiplier: 2,
    infinite: false,
});

// CRITICAL: Connect Lenis to GSAP's ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

// Use GSAP's ticker to drive Lenis (Synchronizes both loops)
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});

// Disable lag smoothing to prevent visual jumps
gsap.ticker.lagSmoothing(0);


/* =========================================
   2. PARTICLE BACKGROUND (PERFORMANCE FIX)
   ========================================= */
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];
let animationFrameId;

// Detect Mobile/Low Power Devices
const isMobile = window.innerWidth < 768;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Particle {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.color = Math.random() > 0.5 ? '#00f3ff' : '#ffea00';
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Wrap edges (Performance: better than creating new objects)
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function initParticles() {
    // If mobile, DON'T run particles (Causes massive lag)
    if (isMobile) return;

    resizeCanvas();
    particles = [];
    // Limit particle count for performance
    for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
    }
    animateParticles();
}

function animateParticles() {
    if (isMobile) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}

// Only init particles on desktop
initParticles();
window.addEventListener('resize', () => {
    if (!isMobile) resizeCanvas();
});


/* =========================================
   3. ANIMATIONS (ROBUST MODE)
   ========================================= */
// Wait for window load to ensure all layouts are calculated
window.addEventListener('load', () => {
    
    // Refresh ScrollTrigger to ensure positions are correct
    ScrollTrigger.refresh();

    // 1. HERO SECTION
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    
    heroTl.fromTo('.hero-panel-main', 
        { x: -50, autoAlpha: 0 }, // Use autoAlpha instead of opacity (prevents glitches)
        { x: 0, autoAlpha: 1, duration: 1 }
    )
    .fromTo('.hero-panel-visual', 
        { x: 50, autoAlpha: 0 }, 
        { x: 0, autoAlpha: 1, duration: 1 }, 
        '-=0.8'
    )
    .fromTo('.block-reveal', 
        { y: 30, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, stagger: 0.1, duration: 0.6 },
        '-=0.5'
    );

    // 2. MISSION BRIEF PANELS
    gsap.utils.toArray('.panel').forEach((panel, i) => {
        gsap.fromTo(panel, 
            { y: 50, autoAlpha: 0 },
            {
                y: 0, 
                autoAlpha: 1, 
                duration: 0.8,
                scrollTrigger: {
                    trigger: panel,
                    start: "top 90%", // Trigger slightly earlier
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // 3. SKILL TREE (The section you said wasn't loading)
    gsap.utils.toArray('.skill-node').forEach((node, i) => {
        gsap.fromTo(node,
            { scale: 0.9, autoAlpha: 0 },
            {
                scale: 1,
                autoAlpha: 1,
                duration: 0.6,
                delay: i * 0.1, // Stagger manually
                scrollTrigger: {
                    trigger: node, // Trigger each node individually
                    start: "top 95%", // Show almost immediately when it enters screen
                }
            }
        );
    });

    // 4. MISSION CARDS
    gsap.utils.toArray('.mission-card').forEach((card, i) => {
        gsap.fromTo(card,
            { x: i % 2 === 0 ? -30 : 30, autoAlpha: 0 },
            {
                x: 0,
                autoAlpha: 1,
                duration: 0.8,
                scrollTrigger: {
                    trigger: card,
                    start: "top 90%"
                }
            }
        );
    });

    // 5. ALLIANCE PARTNERS
    gsap.utils.toArray('.partner-box').forEach((box, i) => {
        gsap.fromTo(box,
            { scale: 0.8, autoAlpha: 0 },
            {
                scale: 1,
                autoAlpha: 1,
                duration: 0.5,
                delay: i * 0.05,
                scrollTrigger: {
                    trigger: '.partners-grid',
                    start: "top 90%"
                }
            }
        );
    });

    // 6. NUMBERS COUNT UP
    document.querySelectorAll('.count-up').forEach(el => {
        const target = parseInt(el.getAttribute('data-target'), 10) || 0;
        ScrollTrigger.create({
            trigger: el,
            start: 'top 95%',
            once: true,
            onEnter: () => {
                gsap.to(el, {
                    innerHTML: target,
                    duration: 2,
                    snap: { innerHTML: 1 },
                    ease: 'power1.out'
                });
            }
        });
    });

    // 7. GLITCH EFFECT (Subtle)
    gsap.to('.glitch-text', {
        skewX: 5,
        duration: 0.1,
        repeat: -1,
        yoyo: true,
        repeatDelay: 3,
        ease: 'power1.inOut'
    });

});

// VanillaTilt (Disable on Touch Devices for Performance)
if (!isMobile) {
    VanillaTilt.init(document.querySelectorAll(".skill-node, .hero-panel-visual"), {
        max: 10,
        speed: 400,
        glare: true,
        "max-glare": 0.2,
    });
}

// Mobile Menu Logic
const mobileBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileBtn && navLinks) {
    mobileBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileBtn.classList.toggle('open');
    });

    document.querySelectorAll('.nav-item, .btn-glitch.small').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileBtn.classList.remove('open');
        });
    });
}