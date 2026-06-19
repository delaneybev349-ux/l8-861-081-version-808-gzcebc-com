(function () {
    const menuButton = document.querySelector("[data-menu-toggle]");
    const mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("is-open");
        });
    }

    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    let currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle("is-active", slideIndex === currentSlide);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle("is-active", dotIndex === currentSlide);
        });
    }

    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5800);
    }

    document.querySelectorAll("[data-search-form]").forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            const input = form.querySelector("input[type='search']");
            const query = input ? input.value.trim() : "";
            const target = form.getAttribute("action") || "search.html";
            window.location.href = query ? target + "?q=" + encodeURIComponent(query) : target;
        });
    });

    const filterRoot = document.querySelector("[data-filter-root]");
    const filterGrid = document.querySelector("[data-filter-grid]");

    if (filterRoot && filterGrid) {
        const cards = Array.from(filterGrid.querySelectorAll("[data-search-card]"));
        const input = filterRoot.querySelector("[data-filter-input]");
        const yearSelect = filterRoot.querySelector("[data-filter-year]");
        const regionSelect = filterRoot.querySelector("[data-filter-region]");
        const typeSelect = filterRoot.querySelector("[data-filter-type]");
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get("q") || "";

        function fillSelect(select, values) {
            if (!select) {
                return;
            }

            values.filter(Boolean).sort(function (a, b) {
                return String(b).localeCompare(String(a), "zh-CN");
            }).forEach(function (value) {
                const option = document.createElement("option");
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        }

        fillSelect(yearSelect, Array.from(new Set(cards.map(function (card) {
            return card.getAttribute("data-year") || "";
        }))));

        fillSelect(regionSelect, Array.from(new Set(cards.map(function (card) {
            return card.getAttribute("data-region") || "";
        }))));

        fillSelect(typeSelect, Array.from(new Set(cards.map(function (card) {
            return card.getAttribute("data-type") || "";
        }))));

        if (input && initialQuery) {
            input.value = initialQuery;
        }

        function applyFilters() {
            const query = input ? input.value.trim().toLowerCase() : "";
            const year = yearSelect ? yearSelect.value : "";
            const region = regionSelect ? regionSelect.value : "";
            const type = typeSelect ? typeSelect.value : "";

            cards.forEach(function (card) {
                const haystack = [
                    card.getAttribute("data-title") || "",
                    card.getAttribute("data-tags") || ""
                ].join(" ").toLowerCase();
                const matchQuery = !query || haystack.indexOf(query) !== -1;
                const matchYear = !year || card.getAttribute("data-year") === year;
                const matchRegion = !region || card.getAttribute("data-region") === region;
                const matchType = !type || card.getAttribute("data-type") === type;
                card.classList.toggle("is-hidden-card", !(matchQuery && matchYear && matchRegion && matchType));
            });
        }

        [input, yearSelect, regionSelect, typeSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        applyFilters();
    }
}());
