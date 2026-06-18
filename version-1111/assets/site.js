(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-mobile-nav]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
                restart();
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                restart();
            });
        });

        show(0);
        restart();
    }

    function setupSearch() {
        var areas = Array.prototype.slice.call(document.querySelectorAll("[data-search-area]"));
        areas.forEach(function (area) {
            var input = area.querySelector("[data-search-input]");
            var cards = Array.prototype.slice.call(area.querySelectorAll(".movie-card, .rank-item"));
            var empty = area.querySelector("[data-empty-state]");
            if (!input || !cards.length) {
                return;
            }

            function filter() {
                var query = input.value.trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-year") || "",
                        card.getAttribute("data-tags") || ""
                    ].join(" ").toLowerCase();

                    var match = !query || haystack.indexOf(query) !== -1;
                    card.style.display = match ? "" : "none";
                    if (match) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            input.addEventListener("input", filter);
        });
    }

    function attachMoviePlayer(videoId, buttonId, overlayId, source) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var overlay = document.getElementById(overlayId);
        var started = false;
        var hlsInstance = null;

        if (!video || !button || !overlay || !source) {
            return;
        }

        function bindSource() {
            if (started) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }

            started = true;
        }

        function play() {
            bindSource();
            overlay.classList.add("is-hidden");
            video.controls = true;

            var action = video.play();
            if (action && typeof action.catch === "function") {
                action.catch(function () {});
            }
        }

        button.addEventListener("click", play);
        overlay.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (!started || video.paused) {
                play();
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance && typeof hlsInstance.destroy === "function") {
                hlsInstance.destroy();
            }
        });
    }

    window.initMoviePlayer = attachMoviePlayer;

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
    });
})();
