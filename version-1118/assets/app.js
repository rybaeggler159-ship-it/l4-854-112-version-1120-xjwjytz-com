(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var navLinks = document.querySelector('[data-nav-links]');

  if (menuButton && navLinks) {
    menuButton.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var next = Number(dot.getAttribute('data-hero-dot')) || 0;
        showSlide(next);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
  var categoryFilter = document.querySelector('[data-filter-category]');
  var typeFilter = document.querySelector('[data-filter-type]');
  var yearFilter = document.querySelector('[data-filter-year]');
  var emptyState = document.querySelector('[data-empty-state]');

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function decadeMatch(year, selected) {
    if (!selected || selected === 'all') {
      return true;
    }
    var value = parseInt(year, 10);
    if (!value) {
      return false;
    }
    if (selected === '1990') {
      return value < 2000;
    }
    var start = parseInt(selected, 10);
    return value >= start && value < start + 10;
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }
    var query = normalize(searchInputs.map(function (input) { return input.value; }).join(' '));
    var selectedCategory = categoryFilter ? categoryFilter.value : 'all';
    var selectedType = typeFilter ? typeFilter.value : 'all';
    var selectedYear = yearFilter ? yearFilter.value : 'all';
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.textContent
      ].join(' '));
      var matchesQuery = !query || haystack.indexOf(query) !== -1;
      var matchesCategory = selectedCategory === 'all' || card.getAttribute('data-category') === selectedCategory;
      var cardType = card.getAttribute('data-type') || '';
      var matchesType = selectedType === 'all' || cardType === selectedType;
      var matchesYear = decadeMatch(card.getAttribute('data-year'), selectedYear);
      var matches = matchesQuery && matchesCategory && matchesType && matchesYear;
      card.style.display = matches ? '' : 'none';
      if (matches) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  searchInputs.forEach(function (input) {
    input.addEventListener('input', applyFilters);
  });

  [categoryFilter, typeFilter, yearFilter].forEach(function (select) {
    if (select) {
      select.addEventListener('change', applyFilters);
    }
  });

  var params = new URLSearchParams(window.location.search);
  var query = params.get('q');
  if (query && searchInputs.length) {
    searchInputs[0].value = query;
    applyFilters();
  }

  var video = document.querySelector('video[data-stream-url]');
  var playButton = document.querySelector('[data-player-start]');
  var playerReady = false;
  var hlsInstance = null;

  function prepareVideo() {
    if (!video || playerReady) {
      return;
    }
    var streamUrl = video.getAttribute('data-stream-url');
    if (!streamUrl) {
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
    playerReady = true;
  }

  function startVideo() {
    if (!video) {
      return;
    }
    prepareVideo();
    if (playButton) {
      playButton.classList.add('is-hidden');
    }
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  if (playButton) {
    playButton.addEventListener('click', startVideo);
  }

  if (video) {
    video.addEventListener('click', function () {
      if (!playerReady) {
        startVideo();
      }
    });
    video.addEventListener('play', function () {
      if (playButton) {
        playButton.classList.add('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
