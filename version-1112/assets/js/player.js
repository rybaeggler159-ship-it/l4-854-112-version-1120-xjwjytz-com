function mountPlayer(videoId, buttonId, coverId, src) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var cover = document.getElementById(coverId);
    var started = false;
    var loaded = false;
    var hls = null;

    if (!video || !button || !cover || !src) {
        return;
    }

    function tryPlay() {
        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {});
        }
    }

    function loadSource() {
        if (loaded) {
            return;
        }

        loaded = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
            video.addEventListener("loadedmetadata", function () {
                if (started) {
                    tryPlay();
                }
            }, { once: true });
            video.load();
            return;
        }

        if (window.Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                if (started) {
                    tryPlay();
                }
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal && hls) {
                    if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                }
            });
            return;
        }

        video.src = src;
        video.load();
    }

    function start() {
        started = true;
        cover.classList.add("is-hidden");
        video.controls = true;
        loadSource();
        tryPlay();
    }

    button.addEventListener("click", start);
    cover.addEventListener("click", start);

    video.addEventListener("click", function () {
        if (!started) {
            start();
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
