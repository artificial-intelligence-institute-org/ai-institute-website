document.addEventListener('DOMContentLoaded', () => {

    /* ─── DOM Elements ─── */

    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const navLinkEls = document.querySelectorAll('.nav-link');
    const backToTop = document.getElementById('backToTop');
    const hero = document.getElementById('hero');
    const revealEls = document.querySelectorAll('.reveal');
    const statNumbers = document.querySelectorAll('.stat-number');

    /* ─── Mobile Menu ─── */

    hamburger.addEventListener('click', () => {
        const isActive = navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');
        hamburger.setAttribute('aria-expanded', isActive);
        document.body.style.overflow = isActive ? 'hidden' : '';
    });

    navLinkEls.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        });
    });

    /* ─── Navbar Scroll Effects ─── */

    function updateNavbar() {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    }

    function updateActiveLink() {
        const scrollPos = window.scrollY + 120;
        let currentId = 'hero';

        document.querySelectorAll('section[id]').forEach(section => {
            const offsetTop = section.offsetTop;
            const offsetBottom = offsetTop + section.offsetHeight;

            if (scrollPos >= offsetTop && scrollPos < offsetBottom) {
                currentId = section.id;
            }
        });

        navLinkEls.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
        });
    }

    function updateBackToTop() {
        backToTop.classList.toggle('visible', window.scrollY > window.innerHeight * 0.5);
    }

    function onScroll() {
        updateNavbar();
        updateActiveLink();
        updateBackToTop();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ─── Smooth Scroll ─── */

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            }
        });
    });

    /* ─── Scroll Reveal (Intersection Observer) ─── */

    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, Number(delay));
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    revealEls.forEach(el => revealObserver.observe(el));

    /* ─── Stats Counter Animation ─── */

    const counterObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.dataset.count, 10);
                animateCounter(el, target);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));

    function animateCounter(el, target) {
        const duration = 2000;
        const start = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(eased * target);

            if (target === 2023) {
                el.textContent = current;
            } else {
                el.textContent = current.toLocaleString() + '+';
            }

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                if (target === 2023) {
                    el.textContent = target;
                } else {
                    el.textContent = target.toLocaleString() + '+';
                }
            }
        }

        requestAnimationFrame(update);
    }

    /* ─── Hero Mouse Parallax ─── */

    if (hero) {
        hero.addEventListener('mousemove', e => {
            const rect = hero.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

            const glows = hero.querySelectorAll('.hero-glow');
            glows.forEach((glow, i) => {
                const factor = (i + 1) * 8;
                glow.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
            });
        });

        hero.addEventListener('mouseleave', () => {
            const glows = hero.querySelectorAll('.hero-glow');
            glows.forEach(glow => {
                glow.style.transform = '';
            });
        });
    }
});
