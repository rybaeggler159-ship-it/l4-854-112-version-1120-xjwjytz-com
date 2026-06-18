(function () {
    function loadScript(src, callback) {
        var existing = document.querySelector('script[src="' + src + '"]');
        if (existing) {
            existing.addEventListener('load', callback, { once: true });
            if (window.Hls) {
                callback();
            }
            return;
        }

        var script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = callback;
        document.head.appendChild(script);
    }

    function startPlayer(shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('[data-player-start]');
        var url = shell.getAttribute('data-video-url');

        if (!video || !url) {
            return;
        }

        function playVideo() {
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        }

        function activate() {
            shell.classList.add('is-playing');
            if (button) {
                button.setAttribute('aria-hidden', 'true');
            }
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            if (!video.src) {
                video.src = url;
            }
            activate();
            playVideo();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            if (!shell._hlsInstance) {
                shell._hlsInstance = new window.Hls({ enableWorker: true });
                shell._hlsInstance.loadSource(url);
                shell._hlsInstance.attachMedia(video);
                shell._hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    activate();
                    playVideo();
                });
            } else {
                activate();
                playVideo();
            }
            return;
        }

        loadScript('https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js', function () {
            startPlayer(shell);
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (shell) {
        var button = shell.querySelector('[data-player-start]');
        var video = shell.querySelector('video');

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                startPlayer(shell);
            });
        }

        shell.addEventListener('click', function (event) {
            if (event.target === video) {
                return;
            }
            if (!shell.classList.contains('is-playing')) {
                startPlayer(shell);
            }
        });
    });
})();
