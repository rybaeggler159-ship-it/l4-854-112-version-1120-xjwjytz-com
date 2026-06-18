(function() {
  var toggle = document.querySelector('.menu-toggle');
  var links = document.querySelector('.nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', function() {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function() {
        showSlide(current + 1);
      }, 5200);
    }
  }

  var input = document.querySelector('[data-search-input]');
  var clearButton = document.querySelector('[data-clear-search]');
  var grid = document.querySelector('[data-card-grid]');

  if (input && grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));

    function filterCards() {
      var query = input.value.trim().toLowerCase();
      cards.forEach(function(card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        card.classList.toggle('is-filtered-out', query && text.indexOf(query) === -1);
      });
    }

    input.addEventListener('input', filterCards);

    if (clearButton) {
      clearButton.addEventListener('click', function() {
        input.value = '';
        filterCards();
        input.focus();
      });
    }
  }
}());
