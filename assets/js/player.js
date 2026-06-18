function initMoviePlayer(videoId, overlayId, buttonId, streamUrl) {
  var video = document.getElementById(videoId);
  var overlay = document.getElementById(overlayId);
  var button = document.getElementById(buttonId);
  var ready = false;
  var hlsInstance = null;

  if (!video || !streamUrl) {
    return;
  }

  function prepare() {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function startPlayback() {
    prepare();
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function() {});
    }
  }

  if (overlay) {
    overlay.addEventListener('click', startPlayback);
  }

  if (button) {
    button.addEventListener('click', function(event) {
      event.stopPropagation();
      startPlayback();
    });
  }

  video.addEventListener('play', function() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  video.addEventListener('ended', function() {
    if (overlay) {
      overlay.classList.remove('is-hidden');
    }
  });

  window.addEventListener('pagehide', function() {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
