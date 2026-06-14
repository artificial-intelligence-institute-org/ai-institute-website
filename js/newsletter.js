document.addEventListener('DOMContentLoaded', () => {

    /* ─── Scroll Reveal ─── */

    const revealEls = document.querySelectorAll('.reveal');

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

    /* ─── Hero Mouse Parallax ─── */

    const hero = document.getElementById('hero');

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
