(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }

    heroIndex = (index + slides.length) % slides.length;

    slides.forEach(function (slide, current) {
      slide.classList.toggle('active', current === heroIndex);
    });

    dots.forEach(function (dot, current) {
      dot.classList.toggle('active', current === heroIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showHero(index);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 5800);
  }

  showHero(0);

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));

  searchInputs.forEach(function (input) {
    var scope = document.querySelector(input.getAttribute('data-search-input')) || document;
    var items = Array.prototype.slice.call(scope.querySelectorAll('[data-title]'));
    var empty = scope.querySelector('[data-empty-state]');

    function applySearch() {
      var query = input.value.trim().toLowerCase();
      var visible = 0;

      items.forEach(function (item) {
        var target = [
          item.getAttribute('data-title'),
          item.getAttribute('data-region'),
          item.getAttribute('data-type'),
          item.getAttribute('data-year'),
          item.getAttribute('data-genre'),
          item.getAttribute('data-tags')
        ].join(' ').toLowerCase();

        var matched = !query || target.indexOf(query) !== -1;
        item.classList.toggle('hidden-by-search', !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    input.addEventListener('input', applySearch);
    applySearch();
  });

  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      var group = document.querySelector(button.getAttribute('data-filter-scope')) || document;
      var value = button.getAttribute('data-filter-value');
      var items = Array.prototype.slice.call(group.querySelectorAll('.movie-card'));
      var siblings = Array.prototype.slice.call(button.parentNode.querySelectorAll('[data-filter-value]'));

      siblings.forEach(function (item) {
        item.classList.remove('active');
      });

      button.classList.add('active');

      items.forEach(function (item) {
        var matched = value === 'all' || item.getAttribute('data-type') === value || item.getAttribute('data-region') === value;
        item.classList.toggle('hidden-by-search', !matched);
      });
    });
  });
})();
