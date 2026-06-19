(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-site-nav]');

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  var sliders = document.querySelectorAll('[data-hero-slider]');

  sliders.forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.slider-dot'));
    var index = 0;

    function show(next) {
      if (!slides.length) {
        return;
      }

      index = (next + slides.length) % slides.length;

      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === index);
      });

      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    show(0);

    if (slides.length > 1) {
      window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
  });

  var filterForms = document.querySelectorAll('[data-filter-scope]');

  filterForms.forEach(function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var select = scope.querySelector('[data-year-select]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
    var empty = scope.querySelector('[data-empty-state]');

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var year = select ? select.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var searchable = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-year') || ''
        ].join(' ').toLowerCase();
        var yearValue = card.getAttribute('data-year') || '';
        var matched = (!keyword || searchable.indexOf(keyword) !== -1) && (!year || yearValue === year);

        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (select) {
      select.addEventListener('change', applyFilter);
    }
  });
}());
