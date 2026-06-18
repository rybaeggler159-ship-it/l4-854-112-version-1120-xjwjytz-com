(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('[data-menu-toggle]');
    var nav = qs('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var root = qs('[data-hero]');
    if (!root) {
      return;
    }
    var slides = qsa('[data-hero-slide]', root);
    var dots = qsa('[data-hero-dot]', root);
    var prev = qs('[data-hero-prev]', root);
    var next = qs('[data-hero-next]', root);
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
        slide.classList.toggle('opacity-100', i === index);
        slide.classList.toggle('opacity-0', i !== index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var panels = qsa('[data-filter-panel]');
    panels.forEach(function (panel) {
      var input = qs('[data-search-input]', panel);
      var buttons = qsa('[data-filter-value]', panel);
      var scopeSelector = panel.getAttribute('data-filter-scope') || 'body';
      var scope = qs(scopeSelector) || document;
      var cards = qsa('[data-movie-card]', scope);
      var active = '全部';

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-category') || '',
            card.getAttribute('data-year') || ''
          ].join(' ').toLowerCase();
          var filterOk = active === '全部' || haystack.indexOf(active.toLowerCase()) !== -1;
          var queryOk = !query || haystack.indexOf(query) !== -1;
          card.classList.toggle('hidden-card', !(filterOk && queryOk));
        });
      }

      if (input) {
        input.addEventListener('input', apply);
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
          input.value = q;
        }
      }
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          buttons.forEach(function (btn) {
            btn.classList.remove('active');
          });
          button.classList.add('active');
          active = button.getAttribute('data-filter-value') || '全部';
          apply();
        });
      });
      apply();
    });
  }

  function initPlayer() {
    var video = qs('#movie-player');
    var button = qs('#play-button');
    var overlay = qs('#player-overlay');
    if (!video || !button) {
      return;
    }
    var source = video.getAttribute('data-src');
    var initialized = false;
    var hls = null;

    function attach() {
      if (initialized || !source) {
        return;
      }
      initialized = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else {
        video.src = source;
      }
    }

    function play() {
      attach();
      if (overlay) {
        overlay.classList.add('hidden');
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (overlay) {
            overlay.classList.remove('hidden');
          }
        });
      }
    }

    button.addEventListener('click', play);
    if (overlay) {
      overlay.addEventListener('click', play);
    }
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('hidden');
      }
    });
    video.addEventListener('pause', function () {
      if (video.currentTime === 0 && overlay) {
        overlay.classList.remove('hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayer();
  });
})();
