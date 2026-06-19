(function () {
    const toggle = document.querySelector('.nav-toggle');
    const panel = document.querySelector('.mobile-panel');

    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            const isOpen = !panel.hasAttribute('hidden');
            if (isOpen) {
                panel.setAttribute('hidden', '');
                toggle.setAttribute('aria-expanded', 'false');
            } else {
                panel.removeAttribute('hidden');
                toggle.setAttribute('aria-expanded', 'true');
            }
        });
    }

    const slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
        const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
        const prev = slider.querySelector('[data-hero-prev]');
        const next = slider.querySelector('[data-hero-next]');
        let index = 0;
        let timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startTimer();
            });
        });

        slider.addEventListener('mouseenter', stopTimer);
        slider.addEventListener('mouseleave', startTimer);
        showSlide(0);
        startTimer();
    }

    function applyFilter(input) {
        const gridId = input.getAttribute('data-grid-filter');
        const grid = document.getElementById(gridId);
        if (!grid) {
            return;
        }
        let message = grid.querySelector('.no-result');
        if (!message) {
            message = document.createElement('div');
            message.className = 'no-result';
            message.textContent = '没有找到匹配内容';
            grid.appendChild(message);
        }
        const query = input.value.trim().toLowerCase();
        const cards = Array.from(grid.querySelectorAll('[data-movie-card]'));
        let visible = 0;
        cards.forEach(function (card) {
            const text = card.getAttribute('data-search') || '';
            const matched = !query || text.indexOf(query) !== -1;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                visible += 1;
            }
        });
        message.style.display = visible ? 'none' : 'block';
    }

    const filters = Array.from(document.querySelectorAll('[data-grid-filter]'));
    filters.forEach(function (input) {
        input.addEventListener('input', function () {
            applyFilter(input);
        });
    });

    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if (q) {
        filters.forEach(function (input) {
            if (input.id === 'site-search-box') {
                input.value = q;
                applyFilter(input);
            }
        });
    }
}());
