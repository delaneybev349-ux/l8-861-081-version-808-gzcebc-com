(function () {
    function $(selector, parent) {
        return (parent || document).querySelector(selector);
    }

    function $all(selector, parent) {
        return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function initMenu() {
        var button = $("[data-menu-toggle]");
        var nav = $("[data-mobile-nav]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slides = $all("[data-hero-slide]");
        var dots = $all("[data-hero-dot]");
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(dotIndex);
                start();
            });
        });
        show(0);
        start();
    }

    function initFilters() {
        $all("[data-page-filter]").forEach(function (input) {
            var target = $(input.getAttribute("data-page-filter"));
            if (!target) {
                return;
            }
            var cards = $all("[data-search]", target);
            input.addEventListener("input", function () {
                var words = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
                cards.forEach(function (card) {
                    var haystack = String(card.getAttribute("data-search") || "").toLowerCase();
                    var matched = words.every(function (word) {
                        return haystack.indexOf(word) !== -1;
                    });
                    card.style.display = matched ? "" : "none";
                });
            });
        });
    }

    function movieCard(movie) {
        return [
            '<article class="movie-card" data-search="' + escapeHtml(movie.search) + '">',
            '    <a href="./' + escapeHtml(movie.file) + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
            '        <figure class="poster-wrap">',
            '            <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '            <span class="play-chip">▶</span>',
            '        </figure>',
            '        <div class="card-body">',
            '            <div class="card-meta">',
            '                <span>' + escapeHtml(movie.year) + '</span>',
            '                <span>' + escapeHtml(movie.region) + '</span>',
            '                <span>' + escapeHtml(movie.rating) + '</span>',
            '            </div>',
            '            <h3>' + escapeHtml(movie.title) + '</h3>',
            '            <p>' + escapeHtml(movie.one_line) + '</p>',
            '        </div>',
            '    </a>',
            '</article>'
        ].join("");
    }

    function initSearchPage() {
        var form = $("[data-search-form]");
        var input = $("[data-search-input]");
        var grid = $("[data-search-grid]");
        var empty = $("[data-search-empty]");
        if (!form || !input || !grid || !window.SEARCH_MOVIES) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;
        function render(query) {
            var words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
            var results = window.SEARCH_MOVIES.filter(function (movie) {
                if (!words.length) {
                    return movie.id <= 72;
                }
                var haystack = String(movie.search || "").toLowerCase();
                return words.every(function (word) {
                    return haystack.indexOf(word) !== -1;
                });
            }).slice(0, 120);
            grid.innerHTML = results.map(movieCard).join("");
            empty.hidden = results.length !== 0;
        }
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            render(input.value);
        });
        input.addEventListener("input", function () {
            render(input.value);
        });
        render(initial);
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initHero();
        initFilters();
        initSearchPage();
    });
}());
