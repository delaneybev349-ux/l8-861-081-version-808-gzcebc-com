const menuButton = document.querySelector('[data-menu-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');

if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('is-open');
    });
}

const hero = document.querySelector('[data-hero]');

if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const next = hero.querySelector('[data-hero-next]');
    const prev = hero.querySelector('[data-hero-prev]');
    let current = 0;
    let timer = null;

    const setSlide = (index) => {
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle('is-active', dotIndex === current);
        });
    };

    const startTimer = () => {
        clearInterval(timer);
        timer = setInterval(() => setSlide(current + 1), 5200);
    };

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            setSlide(index);
            startTimer();
        });
    });

    if (next) {
        next.addEventListener('click', () => {
            setSlide(current + 1);
            startTimer();
        });
    }

    if (prev) {
        prev.addEventListener('click', () => {
            setSlide(current - 1);
            startTimer();
        });
    }

    startTimer();
}

const filterPanel = document.querySelector('[data-filter-panel]');
const cardGrid = document.querySelector('[data-card-grid]');

if (filterPanel && cardGrid) {
    const keywordInput = filterPanel.querySelector('[data-filter-keyword]');
    const yearSelect = filterPanel.querySelector('[data-filter-year]');
    const typeSelect = filterPanel.querySelector('[data-filter-type]');
    const cards = Array.from(cardGrid.querySelectorAll('[data-card]'));
    const emptyState = document.querySelector('[data-empty-state]');

    const applyFilter = () => {
        const keyword = (keywordInput.value || '').trim().toLowerCase();
        const year = yearSelect.value;
        const type = typeSelect.value;
        let visible = 0;

        cards.forEach((card) => {
            const text = [card.dataset.title, card.dataset.region, card.dataset.genre, card.dataset.type].join(' ').toLowerCase();
            const matchedKeyword = !keyword || text.includes(keyword);
            const matchedYear = !year || card.dataset.year === year;
            const matchedType = !type || card.dataset.type === type;
            const matched = matchedKeyword && matchedYear && matchedType;
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden = visible !== 0;
        }
    };

    [keywordInput, yearSelect, typeSelect].forEach((element) => {
        element.addEventListener('input', applyFilter);
        element.addEventListener('change', applyFilter);
    });
}

const searchResults = document.querySelector('[data-search-results]');

if (searchResults && Array.isArray(window.siteMovies)) {
    const params = new URLSearchParams(window.location.search);
    const query = (params.get('q') || '').trim();
    const input = document.querySelector('[data-search-input]');
    const title = document.querySelector('[data-search-title]');
    const empty = document.querySelector('[data-search-empty]');

    if (input) {
        input.value = query;
    }

    const normalized = query.toLowerCase();
    const movies = window.siteMovies
        .filter((movie) => {
            if (!normalized) {
                return true;
            }
            return [movie.title, movie.year, movie.region, movie.type, movie.genre, movie.tags, movie.oneLine]
                .join(' ')
                .toLowerCase()
                .includes(normalized);
        })
        .slice(0, 96);

    if (title) {
        title.textContent = query ? `“${query}”的搜索结果` : '精选影视';
    }

    const createCard = (movie) => {
        const tags = movie.tags
            .slice(0, 2)
            .map((tag) => `<span>${escapeHtml(tag)}</span>`)
            .join('');
        return `<article class="movie-card" data-card>
    <a class="poster-link" href="${movie.url}" aria-label="${escapeHtml(movie.title)}">
        <img src="${movie.image}" alt="${escapeHtml(movie.title)}" loading="lazy">
        <span class="poster-shine"></span>
    </a>
    <div class="movie-card-body">
        <div class="movie-meta-line">
            <span>${escapeHtml(movie.year)}</span>
            <span>${escapeHtml(movie.region)}</span>
            <span>${escapeHtml(movie.type)}</span>
        </div>
        <h2><a href="${movie.url}">${escapeHtml(movie.title)}</a></h2>
        <p>${escapeHtml(movie.oneLine)}</p>
        <div class="tag-row">${tags}</div>
    </div>
</article>`;
    };

    searchResults.innerHTML = movies.map(createCard).join('');

    if (empty) {
        empty.hidden = movies.length !== 0;
    }
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
