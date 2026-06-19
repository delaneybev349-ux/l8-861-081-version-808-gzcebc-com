document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            var isOpen = mobileNav.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", String(isOpen));
        });
    }

    document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
                dot.setAttribute("aria-selected", String(dotIndex === activeIndex));
            });
        }

        function startTimer() {
            if (slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                stopTimer();
                showSlide(index);
                startTimer();
            });
        });

        slider.addEventListener("mouseenter", stopTimer);
        slider.addEventListener("mouseleave", startTimer);
        showSlide(0);
        startTimer();
    });

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
        var input = scope.querySelector("[data-filter-input]");
        var selects = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-select]"));
        var cards = Array.prototype.slice.call(scope.querySelectorAll(".filter-card"));
        var empty = scope.querySelector("[data-no-results]");

        function normalize(value) {
            return String(value || "").trim().toLowerCase();
        }

        function applyFilter() {
            var keyword = normalize(input ? input.value : "");
            var visibleCount = 0;

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-type") + " " + card.getAttribute("data-year") + " " + card.getAttribute("data-category"));
                var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchesSelects = selects.every(function (select) {
                    var key = select.getAttribute("data-filter-select");
                    var selected = normalize(select.value);
                    return !selected || normalize(card.getAttribute("data-" + key)) === selected;
                });
                var isVisible = matchesKeyword && matchesSelects;
                card.hidden = !isVisible;
                if (isVisible) {
                    visibleCount += 1;
                }
            });

            if (empty) {
                empty.hidden = visibleCount !== 0;
            }
        }

        if (input) {
            input.addEventListener("input", applyFilter);
        }
        selects.forEach(function (select) {
            select.addEventListener("change", applyFilter);
        });
        applyFilter();
    });
});
