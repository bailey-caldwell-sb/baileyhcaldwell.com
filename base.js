(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    document.documentElement.classList.add('js');

    function revealOnScroll() {
        const targets = document.querySelectorAll('[data-reveal]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-in');
                observer.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -8% 0px' });

        targets.forEach((target) => {
            const siblings = [...target.parentElement.children].filter((el) => el.hasAttribute('data-reveal'));
            target.style.setProperty('--delay', `${siblings.indexOf(target) * 0.08}s`);
            observer.observe(target);
        });
    }

    function trackSpotlight() {
        document.querySelectorAll('.spot').forEach((surface) => {
            surface.addEventListener('pointermove', (event) => {
                const rect = surface.getBoundingClientRect();
                surface.style.setProperty('--x', `${event.clientX - rect.left}px`);
                surface.style.setProperty('--y', `${event.clientY - rect.top}px`);
            });
        });
    }

    function makeMagnetic() {
        if (!finePointer || prefersReducedMotion) return;
        const STRENGTH = 0.25;
        document.querySelectorAll('.magnetic').forEach((el) => {
            el.addEventListener('pointermove', (event) => {
                const rect = el.getBoundingClientRect();
                el.style.setProperty('--mx', `${(event.clientX - rect.left - rect.width / 2) * STRENGTH}px`);
                el.style.setProperty('--my', `${(event.clientY - rect.top - rect.height / 2) * STRENGTH}px`);
            });
            el.addEventListener('pointerleave', () => {
                el.style.setProperty('--mx', '0px');
                el.style.setProperty('--my', '0px');
            });
        });
    }

    function runClock(element) {
        const format = new Intl.DateTimeFormat('en-US', {
            timeZone: 'America/Los_Angeles',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
        const update = () => { element.textContent = format.format(new Date()); };
        update();
        setInterval(update, 15000);
    }

    function trackNavState(nav) {
        const links = [...nav.querySelectorAll('.nav__links a')];
        const sections = links.map((link) => (link.pathname === location.pathname && link.hash ? document.querySelector(link.hash) : null));

        const onScroll = () => {
            nav.classList.toggle('is-scrolled', window.scrollY > 24);
            const probe = window.innerHeight * 0.4;
            let activeIndex = -1;
            sections.forEach((section, i) => {
                if (section && section.getBoundingClientRect().top < probe) activeIndex = i;
            });
            links.forEach((link, i) => link.classList.toggle('is-active', i === activeIndex));
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    const nav = document.getElementById('nav');
    const clock = document.getElementById('clock');
    const year = document.getElementById('year');

    revealOnScroll();
    trackSpotlight();
    makeMagnetic();
    if (clock) runClock(clock);
    if (nav) trackNavState(nav);
    if (year) year.textContent = new Date().getFullYear();
})();
