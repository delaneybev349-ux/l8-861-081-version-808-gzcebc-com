document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupLocalFilters();
    setupSearchPage();
    setupPlayer();
});

function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
        return;
    }
    toggle.addEventListener('click', function () {
        panel.classList.toggle('open');
        toggle.textContent = panel.classList.contains('open') ? '×' : '☰';
    });
}

function setupHero() {
    var root = document.querySelector('[data-hero]');
    if (!root) {
        return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
        return;
    }
    var index = 0;
    var timer = null;
    function show(next) {
        index = (next + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === index);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === index);
        });
    }
    function start() {
        stop();
        timer = setInterval(function () {
            show(index + 1);
        }, 5200);
    }
    function stop() {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    }
    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
            show(i);
            start();
        });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
}

function setupLocalFilters() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-box]'));
    boxes.forEach(function (box) {
        var search = box.querySelector('[data-local-search]');
        var sort = box.querySelector('[data-sort-select]');
        var grid = document.querySelector('[data-card-grid]');
        var tokenButtons = Array.prototype.slice.call(box.querySelectorAll('[data-filter-token]'));
        if (!grid) {
            return;
        }
        var cards = Array.prototype.slice.call(grid.children);
        var activeToken = '全部';
        function getText(card) {
            return [
                card.getAttribute('data-title') || '',
                card.getAttribute('data-year') || '',
                card.getAttribute('data-category') || '',
                card.getAttribute('data-tags') || '',
                card.getAttribute('data-region') || '',
                card.getAttribute('data-genre') || '',
                card.textContent || ''
            ].join(' ').toLowerCase();
        }
        function apply() {
            var query = search ? search.value.trim().toLowerCase() : '';
            var token = activeToken.toLowerCase();
            cards.forEach(function (card) {
                var haystack = getText(card);
                var matchQuery = !query || haystack.indexOf(query) !== -1;
                var matchToken = activeToken === '全部' || haystack.indexOf(token) !== -1;
                card.classList.toggle('hidden-card', !(matchQuery && matchToken));
            });
            if (sort) {
                var visible = cards.filter(function (card) {
                    return !card.classList.contains('hidden-card');
                });
                var hidden = cards.filter(function (card) {
                    return card.classList.contains('hidden-card');
                });
                visible.sort(function (a, b) {
                    var mode = sort.value;
                    if (mode === 'year') {
                        return (b.getAttribute('data-year') || '').localeCompare(a.getAttribute('data-year') || '');
                    }
                    if (mode === 'title') {
                        return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
                    }
                    if (mode === 'score') {
                        return Number(b.getAttribute('data-score') || 0) - Number(a.getAttribute('data-score') || 0);
                    }
                    return 0;
                });
                visible.concat(hidden).forEach(function (card) {
                    grid.appendChild(card);
                });
            }
        }
        if (search) {
            search.addEventListener('input', apply);
        }
        if (sort) {
            sort.addEventListener('change', apply);
        }
        tokenButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeToken = button.getAttribute('data-filter-token') || '全部';
                tokenButtons.forEach(function (item) {
                    item.classList.toggle('active', item === button);
                });
                apply();
            });
        });
    });
}

function setupSearchPage() {
    var results = document.querySelector('[data-search-results]');
    var form = document.querySelector('[data-search-form]');
    if (!results || !form || !window.MOVIES) {
        return;
    }
    var input = form.querySelector('input[name="q"]');
    var category = document.querySelector('[data-search-category]');
    var year = document.querySelector('[data-search-year]');
    var sort = document.querySelector('[data-search-sort]');
    var status = document.querySelector('[data-search-status]');
    var params = new URLSearchParams(window.location.search);
    if (params.get('q')) {
        input.value = params.get('q');
    }
    function card(movie) {
        var tagHtml = movie.tags.slice(0, 2).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return '<a class="movie-card" href="' + movie.href + '" data-title="' + escapeHtml(movie.title) + '" data-year="' + escapeHtml(movie.year) + '" data-category="' + escapeHtml(movie.category) + '" data-tags="' + escapeHtml(movie.tags.join(' ')) + '" data-region="' + escapeHtml(movie.region) + '" data-genre="' + escapeHtml(movie.genre) + '">' +
            '<div class="poster-frame">' +
                '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
                '<span class="score-badge">★ ' + escapeHtml(movie.score) + '</span>' +
                '<span class="play-mark">▶</span>' +
            '</div>' +
            '<div class="card-info">' +
                '<span class="pill">' + escapeHtml(movie.category) + '</span>' +
                '<h3>' + escapeHtml(movie.title) + '</h3>' +
                '<p>' + escapeHtml(movie.oneLine) + '</p>' +
                '<div class="tag-row">' + tagHtml + '</div>' +
                '<div class="meta-row"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.type) + '</span></div>' +
            '</div>' +
        '</a>';
    }
    function runSearch() {
        var q = input.value.trim().toLowerCase();
        var cat = category ? category.value : '';
        var y = year ? year.value : '';
        var items = window.MOVIES.filter(function (movie) {
            var haystack = [movie.title, movie.oneLine, movie.region, movie.type, movie.year, movie.genre, movie.category, movie.tags.join(' ')].join(' ').toLowerCase();
            return (!q || haystack.indexOf(q) !== -1) && (!cat || movie.category === cat) && (!y || movie.year === y);
        });
        if (sort) {
            if (sort.value === 'year') {
                items.sort(function (a, b) {
                    return String(b.year).localeCompare(String(a.year));
                });
            } else if (sort.value === 'score') {
                items.sort(function (a, b) {
                    return Number(b.score) - Number(a.score);
                });
            } else if (sort.value === 'title') {
                items.sort(function (a, b) {
                    return a.title.localeCompare(b.title, 'zh-Hans-CN');
                });
            }
        }
        var shown = items.slice(0, 120);
        if (status) {
            status.textContent = q || cat || y ? '搜索结果' : '热门推荐';
        }
        results.innerHTML = shown.length ? shown.map(card).join('') : '<div class="empty-state">没有找到相关内容</div>';
    }
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        var next = new URL(window.location.href);
        if (input.value.trim()) {
            next.searchParams.set('q', input.value.trim());
        } else {
            next.searchParams.delete('q');
        }
        window.history.replaceState({}, '', next.toString());
        runSearch();
    });
    [input, category, year, sort].forEach(function (control) {
        if (control) {
            control.addEventListener('input', runSearch);
            control.addEventListener('change', runSearch);
        }
    });
    if (input.value.trim()) {
        runSearch();
    }
}

function setupPlayer() {
    var video = document.querySelector('[data-player]');
    if (!video) {
        return;
    }
    var card = document.querySelector('[data-player-card]');
    var playButtons = Array.prototype.slice.call(document.querySelectorAll('[data-play-button]'));
    var muteButton = document.querySelector('[data-mute-button]');
    var fullscreenButton = document.querySelector('[data-fullscreen-button]');
    var url = video.getAttribute('data-play');
    var loaded = false;
    var hlsInstance = null;
    function loadMedia() {
        if (loaded || !url) {
            return Promise.resolve();
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
            return Promise.resolve();
        }
        video.src = url;
        return Promise.resolve();
    }
    function togglePlay() {
        loadMedia().then(function () {
            if (video.paused) {
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {});
                }
            } else {
                video.pause();
            }
        });
    }
    playButtons.forEach(function (button) {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            togglePlay();
        });
    });
    video.addEventListener('click', togglePlay);
    video.addEventListener('play', function () {
        if (card) {
            card.classList.add('playing');
            card.classList.remove('paused');
        }
        playButtons.forEach(function (button) {
            if (button.textContent.trim() === '播放') {
                button.textContent = '暂停';
            }
        });
    });
    video.addEventListener('pause', function () {
        if (card) {
            card.classList.remove('playing');
            card.classList.add('paused');
        }
        playButtons.forEach(function (button) {
            if (button.textContent.trim() === '暂停') {
                button.textContent = '播放';
            }
        });
    });
    if (muteButton) {
        muteButton.addEventListener('click', function () {
            video.muted = !video.muted;
            muteButton.textContent = video.muted ? '取消静音' : '静音';
        });
    }
    if (fullscreenButton && card) {
        fullscreenButton.addEventListener('click', function () {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else if (card.requestFullscreen) {
                card.requestFullscreen();
            }
        });
    }
    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
