(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            mobileNav.classList.toggle("open");
        });
    }

    var carousel = document.querySelector("[data-hero-carousel]");

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var prev = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, i) {
                slide.classList.toggle("active", i === current);
            });

            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        }

        function startTimer() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                showSlide(i);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var filterRoot = document.querySelector("[data-card-filter]");
    var filterList = document.querySelector("[data-filterable-list]");

    if (filterRoot && filterList) {
        var searchInput = filterRoot.querySelector("#category-search");
        var regionSelect = filterRoot.querySelector("#region-filter");
        var yearSelect = filterRoot.querySelector("#year-filter");
        var typeSelect = filterRoot.querySelector("#type-filter");
        var cards = Array.prototype.slice.call(filterList.querySelectorAll(".movie-card"));

        function applyFilters() {
            var q = searchInput ? searchInput.value.trim().toLowerCase() : "";
            var region = regionSelect ? regionSelect.value : "";
            var year = yearSelect ? yearSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";

            cards.forEach(function (card) {
                var text = card.getAttribute("data-title") || "";
                var cardRegion = card.getAttribute("data-region") || "";
                var cardYear = card.getAttribute("data-year") || "";
                var cardType = card.getAttribute("data-type") || "";
                var matched = true;

                if (q && text.indexOf(q) === -1) {
                    matched = false;
                }

                if (region && cardRegion !== region) {
                    matched = false;
                }

                if (year && cardYear !== year) {
                    matched = false;
                }

                if (type && cardType !== type) {
                    matched = false;
                }

                card.classList.toggle("hidden-card", !matched);
            });
        }

        [searchInput, regionSelect, yearSelect, typeSelect].forEach(function (item) {
            if (item) {
                item.addEventListener("input", applyFilters);
                item.addEventListener("change", applyFilters);
            }
        });
    }

    var yearTabs = Array.prototype.slice.call(document.querySelectorAll("[data-year-tab]"));
    var yearPanels = Array.prototype.slice.call(document.querySelectorAll("[data-year-panel]"));

    if (yearTabs.length && yearPanels.length) {
        yearTabs.forEach(function (tab) {
            tab.addEventListener("click", function () {
                var year = tab.getAttribute("data-year-tab");

                yearTabs.forEach(function (item) {
                    item.classList.toggle("active", item === tab);
                });

                yearPanels.forEach(function (panel) {
                    panel.classList.toggle("active", panel.getAttribute("data-year-panel") === year);
                });
            });
        });
    }

    var searchResults = document.querySelector("[data-search-results]");
    var searchForm = document.querySelector("[data-search-form]");
    var searchField = document.getElementById("site-search-input");

    if (searchResults && searchField && window.SITE_MOVIES) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";
        searchField.value = initialQuery;

        function cardTemplate(movie) {
            var tags = movie.tags.slice(0, 3).map(function (tag) {
                return "<span>" + escapeHtml(tag) + "</span>";
            }).join("");

            return "<article class=\"movie-card\">" +
                "<a class=\"poster-link\" href=\"" + escapeHtml(movie.file) + "\" aria-label=\"" + escapeHtml(movie.title) + "\">" +
                "<img src=\"" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
                "<span class=\"poster-shade\"></span><span class=\"play-badge\">▶</span></a>" +
                "<div class=\"card-body\"><h3><a href=\"" + escapeHtml(movie.file) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
                "<p>" + escapeHtml(movie.oneLine) + "</p>" +
                "<div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
                "<div class=\"tag-row\">" + tags + "</div></div></article>";
        }

        function escapeHtml(text) {
            return String(text || "")
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function runSearch(query) {
            var q = (query || "").trim().toLowerCase();
            var items = window.SITE_MOVIES.filter(function (movie) {
                return !q || movie.search.indexOf(q) !== -1;
            }).slice(0, 160);

            searchResults.innerHTML = items.map(cardTemplate).join("");
        }

        if (searchForm) {
            searchForm.addEventListener("submit", function (event) {
                event.preventDefault();
                var q = searchField.value.trim();
                var url = q ? "search.html?q=" + encodeURIComponent(q) : "search.html";
                window.history.replaceState(null, "", url);
                runSearch(q);
            });
        }

        searchField.addEventListener("input", function () {
            runSearch(searchField.value);
        });

        runSearch(initialQuery);
    }
})();
