const state = {
    hlsModulePromise: null
};

function normalizeText(value) {
    return String(value || '').trim().toLowerCase();
}

function initMobileMenu() {
    const button = document.querySelector('[data-menu-toggle]');
    const menu = document.querySelector('[data-mobile-menu]');

    if (!button || !menu) {
        return;
    }

    button.addEventListener('click', () => {
        const isOpen = menu.classList.toggle('is-open');
        document.body.classList.toggle('menu-open', isOpen);
        button.setAttribute('aria-expanded', String(isOpen));
    });

    menu.addEventListener('click', (event) => {
        if (event.target.matches('a')) {
            menu.classList.remove('is-open');
            document.body.classList.remove('menu-open');
            button.setAttribute('aria-expanded', 'false');
        }
    });
}

function initHeroCarousel() {
    const carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
        return;
    }

    const slides = Array.from(carousel.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(carousel.querySelectorAll('[data-hero-dot]'));
    let current = 0;
    let timer = null;

    function show(index) {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    }

    function start() {
        stop();
        timer = window.setInterval(() => {
            show(current + 1);
        }, 5600);
    }

    function stop() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
    }

    dots.forEach((dot) => {
        dot.addEventListener('click', () => {
            const index = Number(dot.dataset.heroDot || 0);
            show(index);
            start();
        });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
}

function initMovieFilters() {
    const panel = document.querySelector('[data-filter-panel]');
    const grid = document.querySelector('[data-movie-grid]');

    if (!panel || !grid) {
        return;
    }

    const cards = Array.from(grid.querySelectorAll('.movie-card'));
    const queryInput = panel.querySelector('[data-filter-query]');
    const yearSelect = panel.querySelector('[data-filter-year]');
    const regionSelect = panel.querySelector('[data-filter-region]');
    const typeSelect = panel.querySelector('[data-filter-type]');
    const categorySelect = panel.querySelector('[data-filter-category]');
    const resetButton = panel.querySelector('[data-filter-reset]');
    const status = document.querySelector('[data-filter-status]');

    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get('q');

    if (initialQuery && queryInput) {
        queryInput.value = initialQuery;
    }

    function applyFilters() {
        const query = normalizeText(queryInput ? queryInput.value : '');
        const year = normalizeText(yearSelect ? yearSelect.value : '');
        const region = normalizeText(regionSelect ? regionSelect.value : '');
        const type = normalizeText(typeSelect ? typeSelect.value : '');
        const category = normalizeText(categorySelect ? categorySelect.value : '');
        let visible = 0;

        cards.forEach((card) => {
            const searchText = normalizeText(card.dataset.search);
            const matchesQuery = !query || searchText.includes(query);
            const matchesYear = !year || normalizeText(card.dataset.year) === year;
            const matchesRegion = !region || normalizeText(card.dataset.region) === region;
            const matchesType = !type || normalizeText(card.dataset.type) === type;
            const matchesCategory = !category || normalizeText(card.dataset.category) === category;
            const shouldShow = matchesQuery && matchesYear && matchesRegion && matchesType && matchesCategory;

            card.hidden = !shouldShow;

            if (shouldShow) {
                visible += 1;
            }
        });

        if (status) {
            status.textContent = `正在显示 ${visible} 部内容`;
        }
    }

    [queryInput, yearSelect, regionSelect, typeSelect, categorySelect].forEach((control) => {
        if (control) {
            control.addEventListener('input', applyFilters);
            control.addEventListener('change', applyFilters);
        }
    });

    if (resetButton) {
        resetButton.addEventListener('click', () => {
            [queryInput, yearSelect, regionSelect, typeSelect, categorySelect].forEach((control) => {
                if (control) {
                    control.value = '';
                }
            });
            applyFilters();
        });
    }

    applyFilters();
}

async function getHlsConstructor() {
    if (!state.hlsModulePromise) {
        state.hlsModulePromise = import('./hls-vendor-dru42stk.js');
    }

    const module = await state.hlsModulePromise;
    return module.H || module.default;
}

function setPlayerStatus(shell, message) {
    const status = shell.querySelector('[data-player-status]');

    if (status) {
        status.textContent = message || '';
    }
}

async function attachHlsSource(video, source, shell) {
    if (!source) {
        setPlayerStatus(shell, '当前影片未配置播放源。');
        return;
    }

    if (video.dataset.ready === 'true') {
        return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.dataset.ready = 'true';
        setPlayerStatus(shell, '已使用浏览器原生 HLS 播放能力。');
        return;
    }

    try {
        const Hls = await getHlsConstructor();

        if (Hls && Hls.isSupported && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            video._hlsInstance = hls;
            video.dataset.ready = 'true';
            setPlayerStatus(shell, 'HLS 播放源已加载。');
            return;
        }
    } catch (error) {
        console.warn('HLS module failed to load:', error);
    }

    video.src = source;
    video.dataset.ready = 'true';
    setPlayerStatus(shell, '浏览器将尝试直接播放该播放源。');
}

function initPlayers() {
    const players = Array.from(document.querySelectorAll('[data-player]'));

    players.forEach((shell) => {
        const video = shell.querySelector('video[data-hls-url]');
        const overlay = shell.querySelector('.play-overlay');

        if (!video || !overlay) {
            return;
        }

        overlay.addEventListener('click', async () => {
            const source = video.dataset.hlsUrl;
            setPlayerStatus(shell, '正在初始化播放源…');
            await attachHlsSource(video, source, shell);
            shell.classList.add('is-playing');

            try {
                await video.play();
            } catch (error) {
                setPlayerStatus(shell, '播放已准备好，请再次点击视频控件开始播放。');
            }
        });

        video.addEventListener('play', () => {
            shell.classList.add('is-playing');
        });

        video.addEventListener('error', () => {
            setPlayerStatus(shell, '播放源加载失败，请检查网络或播放源可用性。');
        });
    });
}

function init() {
    initMobileMenu();
    initHeroCarousel();
    initMovieFilters();
    initPlayers();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
