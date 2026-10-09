(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function startDotField(canvas) {
        const ctx = canvas.getContext('2d');
        const SPACING = 26;
        const POINTER_RADIUS = 220;
        const pointer = { x: -9999, y: -9999 };
        let width = 0;
        let height = 0;
        let frameId = null;
        let visible = true;

        function resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = canvas.clientWidth;
            height = canvas.clientHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        function flow(x, y, t) {
            return Math.sin(x * 0.006 + t * 0.6) * Math.cos(y * 0.008 - t * 0.4)
                + Math.sin((x + y) * 0.004 + t * 0.3) * 0.5;
        }

        function draw(time) {
            const t = time / 1000;
            ctx.clearRect(0, 0, width, height);
            for (let y = SPACING / 2; y < height; y += SPACING) {
                for (let x = SPACING / 2; x < width; x += SPACING) {
                    const wave = flow(x, y, t);
                    const dx = x - pointer.x;
                    const dy = y - pointer.y;
                    const proximity = Math.max(0, 1 - Math.hypot(dx, dy) / POINTER_RADIUS);
                    const push = proximity * proximity * 18;
                    const angle = Math.atan2(dy, dx);
                    const px = x + Math.cos(angle) * push + wave * 3;
                    const py = y + Math.sin(angle) * push + wave * 3;
                    const glow = Math.max(0, wave) * 0.35 + proximity;
                    const size = 1 + glow * 1.6;

                    ctx.fillStyle = proximity > 0.05
                        ? `rgba(200, 255, 60, ${0.15 + proximity * 0.75})`
                        : `rgba(236, 239, 233, ${0.12 + Math.max(0, wave) * 0.22})`;
                    ctx.fillRect(px - size / 2, py - size / 2, size, size);
                }
            }
        }

        function loop(time) {
            draw(time);
            frameId = visible ? requestAnimationFrame(loop) : null;
        }

        function resume() {
            if (!frameId && visible && !document.hidden) frameId = requestAnimationFrame(loop);
        }

        resize();
        window.addEventListener('resize', () => {
            resize();
            if (prefersReducedMotion) draw(0);
        });

        if (prefersReducedMotion) {
            draw(0);
            return;
        }

        canvas.parentElement.addEventListener('pointermove', (event) => {
            const rect = canvas.getBoundingClientRect();
            pointer.x = event.clientX - rect.left;
            pointer.y = event.clientY - rect.top;
        });
        canvas.parentElement.addEventListener('pointerleave', () => {
            pointer.x = -9999;
            pointer.y = -9999;
        });

        new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            resume();
        }).observe(canvas);

        document.addEventListener('visibilitychange', resume);
        resume();
    }

    function startScrambleRotator(element, words) {
        const GLYPHS = '!<>-_\\/[]{}=+*^?#01';
        const HOLD_MS = 2600;
        const FRAMES = 22;
        let index = 0;

        function scrambleTo(target) {
            const from = element.textContent;
            const length = Math.max(from.length, target.length);
            let frame = 0;

            function tick() {
                const settled = Math.floor((frame / FRAMES) * length);
                let output = '';
                for (let i = 0; i < length; i++) {
                    if (i < settled) output += target[i] || '';
                    else if (i < target.length) output += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
                }
                element.textContent = output;
                if (frame++ < FRAMES) requestAnimationFrame(tick);
                else element.textContent = target;
            }
            tick();
        }

        if (prefersReducedMotion) return;
        setInterval(() => {
            index = (index + 1) % words.length;
            scrambleTo(words[index]);
        }, HOLD_MS);
    }

    function countUp(element) {
        const target = Number(element.dataset.count);
        const DURATION_MS = 1400;
        const start = performance.now();

        function tick(now) {
            const progress = Math.min(1, (now - start) / DURATION_MS);
            const eased = 1 - Math.pow(1 - progress, 4);
            element.textContent = Math.round(target * eased);
            if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }

    function countStatsWhenVisible() {
        if (prefersReducedMotion) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                countUp(entry.target);
                observer.unobserve(entry.target);
            });
        }, { threshold: 0.6 });
        document.querySelectorAll('[data-count]').forEach((el) => observer.observe(el));
    }

    function setupServiceAccordion(list) {
        list.querySelectorAll('.svc__row').forEach((button) => {
            button.addEventListener('click', () => {
                const item = button.closest('.svc__item');
                const opening = !item.classList.contains('is-open');
                item.classList.toggle('is-open', opening);
                button.setAttribute('aria-expanded', String(opening));
            });
        });
    }

    startDotField(document.getElementById('field'));
    startScrambleRotator(document.getElementById('rotator'), [
        'AI pilots',
        'cloud spend',
        'on-prem apps',
        'technical deals',
        'partnerships',
    ]);
    countStatsWhenVisible();
    setupServiceAccordion(document.getElementById('svc'));
})();
