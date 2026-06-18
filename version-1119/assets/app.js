(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-site-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        if (!slides.length) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        show(0);
        window.setInterval(function () {
            show(index + 1);
        }, 5200);
    }

    function setupListingFilters() {
        var listings = Array.prototype.slice.call(document.querySelectorAll("[data-listing]"));
        listings.forEach(function (listing) {
            var input = listing.querySelector("[data-search-input]");
            var buttons = Array.prototype.slice.call(listing.querySelectorAll("[data-filter]"));
            var cards = Array.prototype.slice.call(listing.querySelectorAll(".movie-card"));
            var empty = listing.querySelector("[data-empty]");
            var active = "all";

            function matchesFilter(card) {
                var year = parseInt(card.getAttribute("data-year") || "0", 10);
                var type = card.getAttribute("data-type") || "";
                var text = card.getAttribute("data-search") || "";
                if (active === "all") {
                    return true;
                }
                if (active === "latest") {
                    return year >= 2024;
                }
                if (active === "classic") {
                    return year > 0 && year < 2010;
                }
                if (active === "movie") {
                    return type.indexOf("电影") !== -1;
                }
                if (active === "series") {
                    return type.indexOf("剧") !== -1;
                }
                if (active === "animation") {
                    return text.indexOf("动画") !== -1;
                }
                if (active === "documentary") {
                    return text.indexOf("纪录") !== -1 || text.indexOf("传记") !== -1;
                }
                return true;
            }

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var visible = 0;
                cards.forEach(function (card) {
                    var text = (card.getAttribute("data-search") || "").toLowerCase();
                    var ok = (!query || text.indexOf(query) !== -1) && matchesFilter(card);
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.style.display = visible ? "none" : "block";
                }
            }

            if (input) {
                input.addEventListener("input", apply);
            }
            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    active = button.getAttribute("data-filter") || "all";
                    buttons.forEach(function (item) {
                        item.classList.toggle("is-active", item === button);
                    });
                    apply();
                });
            });
            apply();
        });
    }

    window.initMoviePlayer = function (videoId, buttonId, overlayId, source) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var overlay = document.getElementById(overlayId);
        if (!video || !button || !overlay || !source) {
            return;
        }

        function startAfterReady() {
            var playTask = video.play();
            if (playTask && playTask.catch) {
                playTask.catch(function () {
                    overlay.classList.remove("is-hidden");
                });
            }
        }

        function loadAndPlay() {
            overlay.classList.add("is-hidden");
            if (video.getAttribute("data-ready") === "1") {
                startAfterReady();
                return;
            }
            video.setAttribute("data-ready", "1");
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                startAfterReady();
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    startAfterReady();
                });
                video._hls = hls;
                return;
            }
            video.src = source;
            startAfterReady();
        }

        button.addEventListener("click", function (event) {
            event.preventDefault();
            loadAndPlay();
        });
        overlay.addEventListener("click", function () {
            loadAndPlay();
        });
        video.addEventListener("click", function () {
            if (video.getAttribute("data-ready") !== "1") {
                loadAndPlay();
            }
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupListingFilters();
    });
})();
