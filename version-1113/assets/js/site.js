(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            var isOpen = mobileNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startAuto() {
            stopAuto();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stopAuto() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                startAuto();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                startAuto();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                startAuto();
            });
        });

        hero.addEventListener('mouseenter', stopAuto);
        hero.addEventListener('mouseleave', startAuto);
        show(0);
        startAuto();
    }

    var filterBar = document.querySelector('[data-filter-bar]');
    var filterList = document.querySelector('[data-filter-list]');

    if (filterBar && filterList) {
        var input = filterBar.querySelector('[data-filter-input]');
        var yearSelect = filterBar.querySelector('[data-filter-year]');
        var regionSelect = filterBar.querySelector('[data-filter-region]');
        var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-movie-card]'));
        var emptyState = document.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q');

        if (initialQuery && input) {
            input.value = initialQuery;
        }

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function applyFilter() {
            var query = normalize(input ? input.value : '');
            var year = normalize(yearSelect ? yearSelect.value : '');
            var region = normalize(regionSelect ? regionSelect.value : '');
            var visibleCount = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-region'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-tags')
                ].join(' '));
                var cardYear = normalize(card.getAttribute('data-year'));
                var cardRegion = normalize(card.getAttribute('data-region'));
                var isMatch = true;

                if (query && haystack.indexOf(query) === -1) {
                    isMatch = false;
                }
                if (year && cardYear !== year) {
                    isMatch = false;
                }
                if (region && cardRegion !== region) {
                    isMatch = false;
                }

                card.style.display = isMatch ? '' : 'none';
                if (isMatch) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle('is-visible', visibleCount === 0);
            }
        }

        [input, yearSelect, regionSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilter);
                control.addEventListener('change', applyFilter);
            }
        });

        applyFilter();
    }
})();
