(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuButton.textContent = open ? '×' : '☰';
    });
  }

  var hero = document.querySelector('.hero');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('.hero-prev');
    var next = hero.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) clearInterval(timer);
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

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  var filterPages = Array.prototype.slice.call(document.querySelectorAll('.filter-page'));
  filterPages.forEach(function (page) {
    var input = page.querySelector('.filter-input');
    var year = page.querySelector('.filter-year');
    var cards = Array.prototype.slice.call(page.querySelectorAll('[data-title]'));

    if (year && year.options.length <= 1) {
      var years = [];
      cards.forEach(function (card) {
        var value = card.getAttribute('data-year') || '';
        if (value && years.indexOf(value) === -1) years.push(value);
      });
      years.sort().reverse().slice(0, 60).forEach(function (value) {
        var option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        year.appendChild(option);
      });
    }

    var params = new URLSearchParams(window.location.search);
    if (input && params.get('q')) {
      input.value = params.get('q');
    }

    function apply() {
      var term = input ? input.value.trim().toLowerCase() : '';
      var selectedYear = year ? year.value : '';
      cards.forEach(function (card) {
        var text = [card.getAttribute('data-text'), card.getAttribute('data-title'), card.getAttribute('data-region'), card.getAttribute('data-type')].join(' ').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var matched = (!term || text.indexOf(term) !== -1) && (!selectedYear || cardYear === selectedYear);
        card.classList.toggle('is-hidden-card', !matched);
      });
    }

    if (input) input.addEventListener('input', apply);
    if (year) year.addEventListener('change', apply);
    apply();
  });
})();

function initMoviePlayer(source) {
  var video = document.getElementById('movie-video');
  var overlay = document.getElementById('player-overlay');
  var button = document.getElementById('player-start');
  if (!video || !source) return;

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
  } else if (window.Hls && window.Hls.isSupported()) {
    var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
    hls.loadSource(source);
    hls.attachMedia(video);
  } else {
    video.src = source;
  }

  function hideOverlay() {
    if (overlay) overlay.classList.add('is-hidden');
  }

  function showOverlay() {
    if (overlay && video.paused && video.currentTime === 0) overlay.classList.remove('is-hidden');
  }

  function begin() {
    hideOverlay();
    var attempt = video.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(function () {
        showOverlay();
      });
    }
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.stopPropagation();
      begin();
    });
  }
  if (overlay) overlay.addEventListener('click', begin);
  video.addEventListener('play', hideOverlay);
  video.addEventListener('ended', showOverlay);
}
