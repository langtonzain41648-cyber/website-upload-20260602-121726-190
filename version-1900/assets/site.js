(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var searchJump = document.querySelector('[data-search-jump]');
  if (searchJump) {
    searchJump.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = searchJump.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      var target = './search.html';
      if (query) {
        target += '?q=' + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]')).forEach(function (panel) {
    var root = panel.closest('section') || document;
    var cards = Array.prototype.slice.call(root.querySelectorAll('.filter-grid .movie-card'));
    var search = panel.querySelector('[data-filter-search]');
    var genre = panel.querySelector('[data-filter-genre]');
    var region = panel.querySelector('[data-filter-region]');
    var year = panel.querySelector('[data-filter-year]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (initialQuery && search) {
      search.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      var query = normalize(search && search.value);
      var genreValue = normalize(genre && genre.value);
      var regionValue = normalize(region && region.value);
      var yearValue = normalize(year && year.value);

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' '));

        var ok = true;
        if (query && haystack.indexOf(query) === -1) {
          ok = false;
        }
        if (genreValue && normalize(card.getAttribute('data-genre')).indexOf(genreValue) === -1) {
          ok = false;
        }
        if (regionValue && normalize(card.getAttribute('data-region')).indexOf(regionValue) === -1) {
          ok = false;
        }
        if (yearValue && normalize(card.getAttribute('data-year')).indexOf(yearValue) === -1) {
          ok = false;
        }
        card.classList.toggle('is-hidden', !ok);
      });
    }

    [search, genre, region, year].forEach(function (control) {
      if (!control) {
        return;
      }
      control.addEventListener('input', applyFilter);
      control.addEventListener('change', applyFilter);
    });

    applyFilter();
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (block) {
    var video = block.querySelector('video');
    var cover = block.querySelector('.player-cover');
    var source = block.getAttribute('data-video-url');
    var attached = false;

    if (!video || !source) {
      return;
    }

    function attachSource() {
      if (attached) {
        return;
      }
      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        block.hlsPlayer = hls;
      } else {
        video.src = source;
      }
    }

    function startPlayer() {
      attachSource();
      video.controls = true;
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener('click', startPlayer);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayer();
      }
    });
  });
}());
