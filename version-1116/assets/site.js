(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function initMenu() {
    var button = qs('[data-menu-button]');
    var nav = qs('[data-nav-links]');

    if (!button || !nav) {
      return;
    }

    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');

    if (!slides.length) {
      return;
    }

    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });

    setInterval(function () {
      show(current + 1);
    }, 5200);
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initFilters() {
    var panels = qsa('[data-filter-panel]');

    panels.forEach(function (panel) {
      var input = qs('[data-search-input]', panel);
      var category = qs('[data-category-select]', panel);
      var year = qs('[data-year-select]', panel);
      var reset = qs('[data-reset-filter]', panel);
      var targetSelector = panel.getAttribute('data-target');
      var target = targetSelector ? qs(targetSelector) : null;

      if (!target) {
        target = qs('[data-filterable]');
      }

      if (!target) {
        return;
      }

      var cards = qsa('[data-card]', target);

      function apply() {
        var keyword = normalize(input && input.value);
        var categoryValue = normalize(category && category.value);
        var yearValue = normalize(year && year.value);

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-genre'));
          var cardCategory = normalize(card.getAttribute('data-category'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchedCategory = !categoryValue || cardCategory === categoryValue;
          var matchedYear = !yearValue || cardYear === yearValue;
          card.classList.toggle('hidden-card', !(matchedKeyword && matchedCategory && matchedYear));
        });
      }

      if (input) {
        input.addEventListener('input', apply);
      }

      if (category) {
        category.addEventListener('change', apply);
      }

      if (year) {
        year.addEventListener('change', apply);
      }

      if (reset) {
        reset.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          if (category) {
            category.value = '';
          }
          if (year) {
            year.value = '';
          }
          apply();
        });
      }
    });
  }

  function attachStream(video, url) {
    if (!video || !url) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
    } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      if (video._hlsInstance) {
        video._hlsInstance.destroy();
      }
      var hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      video._hlsInstance = hls;
      hls.loadSource(url);
      hls.attachMedia(video);
    } else {
      video.src = url;
    }
  }

  function initPlayers() {
    qsa('[data-player]').forEach(function (player) {
      var video = qs('video', player);
      var cover = qs('[data-player-cover]', player);
      var button = qs('[data-play-button]', player);
      var url = player.getAttribute('data-url');
      var started = false;

      function start() {
        if (!video) {
          return;
        }

        if (!started) {
          attachStream(video, url);
          started = true;
        }

        if (cover) {
          cover.classList.add('is-hidden');
        }

        video.play().catch(function () {});
      }

      if (button) {
        button.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          start();
        });
      }

      if (cover) {
        cover.addEventListener('click', start);
      }

      if (video) {
        video.addEventListener('click', function () {
          if (!started) {
            start();
          }
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
