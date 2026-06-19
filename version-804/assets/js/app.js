(function () {
    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var menuButton = document.querySelector('.menu-toggle');
        var mobilePanel = document.querySelector('.mobile-panel');
        if (menuButton && mobilePanel) {
            menuButton.addEventListener('click', function () {
                mobilePanel.classList.toggle('open');
            });
        }

        initHeroCarousel();
        initFilters();
        initPlayers();
    });

    function initHeroCarousel() {
        var box = document.querySelector('.hero-carousel');
        if (!box) return;
        var slides = Array.prototype.slice.call(box.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(box.querySelectorAll('.hero-dots button'));
        if (!slides.length) return;
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === current);
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-slide') || 0));
                restart();
            });
        });

        function restart() {
            if (timer) window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(current + 1);
            }, 4800);
        }

        restart();
    }

    function initFilters() {
        var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
        scopes.forEach(function (scope) {
            var textInput = scope.querySelector('[data-filter-text]');
            var yearSelect = scope.querySelector('[data-filter-year]');
            var genreSelect = scope.querySelector('[data-filter-genre]');
            var list = scope.parentElement.querySelector('.filter-list');
            var empty = scope.parentElement.querySelector('.empty-state');
            if (!list) return;
            var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q && textInput) textInput.value = q;

            function normalize(value) {
                return String(value || '').toLowerCase().trim();
            }

            function apply() {
                var query = normalize(textInput ? textInput.value : '');
                var year = normalize(yearSelect ? yearSelect.value : '');
                var genre = normalize(genreSelect ? genreSelect.value : '');
                var visible = 0;
                cards.forEach(function (card) {
                    var blob = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-tags'),
                        card.textContent
                    ].join(' '));
                    var ok = true;
                    if (query && blob.indexOf(query) === -1) ok = false;
                    if (year && normalize(card.getAttribute('data-year')) !== year) ok = false;
                    if (genre && normalize(card.getAttribute('data-genre')).indexOf(genre) === -1 && normalize(card.getAttribute('data-tags')).indexOf(genre) === -1) ok = false;
                    card.hidden = !ok;
                    if (ok) visible += 1;
                });
                if (empty) empty.hidden = visible !== 0;
            }

            [textInput, yearSelect, genreSelect].forEach(function (el) {
                if (el) el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', apply);
            });
            apply();
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var overlay = player.querySelector('.video-overlay');
            if (!video || !overlay) return;
            var stream = video.getAttribute('data-stream');
            var started = false;
            var hls = null;

            function attach() {
                if (started) return;
                started = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else {
                    video.src = stream;
                }
            }

            function play() {
                attach();
                overlay.style.display = 'none';
                video.setAttribute('controls', 'controls');
                var promise = video.play();
                if (promise && promise.catch) promise.catch(function () {});
            }

            overlay.addEventListener('click', play);
            video.addEventListener('click', function () {
                if (!started) {
                    play();
                    return;
                }
                if (video.paused) {
                    video.play();
                } else {
                    video.pause();
                }
            });
            window.addEventListener('pagehide', function () {
                if (hls && hls.destroy) hls.destroy();
            });
        });
    }
})();
