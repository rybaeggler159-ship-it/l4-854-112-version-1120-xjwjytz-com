(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  ready(function () {
    var video = document.getElementById("movie-player");
    var trigger = document.querySelector("[data-player-trigger]");
    var hls = null;
    var attached = false;

    if (!video) {
      return;
    }

    function playVideo() {
      var stream = video.getAttribute("data-stream");

      if (!stream) {
        return;
      }

      if (!attached) {
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
          attached = true;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          attached = true;
        } else {
          video.src = stream;
          attached = true;
        }
      }

      if (trigger) {
        trigger.classList.add("is-hidden");
      }

      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          if (trigger) {
            trigger.classList.remove("is-hidden");
          }
        });
      }
    }

    if (trigger) {
      trigger.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
      if (!attached || video.paused) {
        playVideo();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
})();
