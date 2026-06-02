(() => {
    const menuButton = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (menuButton && navMenu) {
        menuButton.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', String(isOpen));
        });
    }

    const hero = document.querySelector('[data-hero-carousel]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('.hero-dots button'));
        let activeIndex = 0;

        const showSlide = (index) => {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach((dot, dotIndex) => {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        };

        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => showSlide(index));
        });

        if (slides.length > 1) {
            window.setInterval(() => showSlide(activeIndex + 1), 5200);
        }
    }

    const heroSearch = document.querySelector('[data-hero-search]');
    if (heroSearch) {
        heroSearch.addEventListener('submit', (event) => {
            event.preventDefault();
            const input = heroSearch.querySelector('input');
            const keyword = input ? input.value.trim() : '';
            const target = keyword ? `search.html?q=${encodeURIComponent(keyword)}` : 'search.html';
            window.location.href = target;
        });
    }

    const filterRoot = document.querySelector('[data-filter-root]');
    if (filterRoot) {
        const keywordInput = filterRoot.querySelector('[data-filter-keyword]');
        const categorySelect = filterRoot.querySelector('[data-filter-category]');
        const sortSelect = filterRoot.querySelector('[data-filter-sort]');
        const clearButton = filterRoot.querySelector('[data-filter-clear]');
        const resultCount = filterRoot.querySelector('[data-filter-count]');
        const emptyState = filterRoot.querySelector('[data-empty-state]');
        const grid = filterRoot.querySelector('[data-card-grid]');
        const cards = Array.from(filterRoot.querySelectorAll('.movie-card'));

        const params = new URLSearchParams(window.location.search);
        const preset = params.get('q');
        if (preset && keywordInput) {
            keywordInput.value = preset;
        }

        const normalize = (value) => (value || '').toString().trim().toLowerCase();

        const applyFilters = () => {
            const keyword = normalize(keywordInput ? keywordInput.value : '');
            const category = categorySelect ? categorySelect.value : 'all';
            const sort = sortSelect ? sortSelect.value : 'default';
            let visibleCards = [];

            cards.forEach((card) => {
                const searchText = normalize(card.getAttribute('data-search'));
                const cardCategory = card.getAttribute('data-category') || '';
                const matchKeyword = !keyword || searchText.includes(keyword);
                const matchCategory = category === 'all' || cardCategory === category;
                const visible = matchKeyword && matchCategory;
                card.style.display = visible ? '' : 'none';
                if (visible) {
                    visibleCards.push(card);
                }
            });

            if (sort !== 'default' && grid) {
                visibleCards = visibleCards.sort((a, b) => {
                    if (sort === 'year-desc') {
                        return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
                    }
                    if (sort === 'year-asc') {
                        return Number(a.getAttribute('data-year') || 0) - Number(b.getAttribute('data-year') || 0);
                    }
                    return a.getAttribute('data-title').localeCompare(b.getAttribute('data-title'), 'zh-Hans-CN');
                });
                visibleCards.forEach((card) => grid.appendChild(card));
            }

            if (resultCount) {
                resultCount.textContent = String(visibleCards.length);
            }
            if (emptyState) {
                emptyState.classList.toggle('is-visible', visibleCards.length === 0);
            }
        };

        [keywordInput, categorySelect, sortSelect].forEach((control) => {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        if (clearButton) {
            clearButton.addEventListener('click', () => {
                if (keywordInput) {
                    keywordInput.value = '';
                }
                if (categorySelect) {
                    categorySelect.value = 'all';
                }
                if (sortSelect) {
                    sortSelect.value = 'default';
                }
                applyFilters();
            });
        }

        applyFilters();
    }
})();
