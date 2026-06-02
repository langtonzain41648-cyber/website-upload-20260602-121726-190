(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function setupNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".site-nav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHeroCarousel() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var thumbs = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-thumb]"));
    var next = hero.querySelector("[data-hero-next]");
    var prev = hero.querySelector("[data-hero-prev]");
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === current);
      });
      thumbs.forEach(function (thumb, itemIndex) {
        thumb.classList.toggle("is-active", itemIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    thumbs.forEach(function (thumb, index) {
      thumb.addEventListener("mouseenter", function () {
        show(index);
      });
    });
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-search-box]");
      var chips = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-value]"));
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      var empty = scope.querySelector("[data-empty-state]");
      var activeValue = "all";

      function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
      }

      function filter() {
        var keyword = normalize(input ? input.value : "");
        var shown = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-year"),
            card.getAttribute("data-type"),
            card.getAttribute("data-tags")
          ].join(" "));
          var matchesText = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesChip = activeValue === "all" || haystack.indexOf(normalize(activeValue)) !== -1;
          var visible = matchesText && matchesChip;
          card.style.display = visible ? "" : "none";
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", shown === 0);
        }
      }

      if (input) {
        input.addEventListener("input", filter);
      }
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          activeValue = chip.getAttribute("data-filter-value") || "all";
          chips.forEach(function (item) {
            item.classList.toggle("is-active", item === chip);
          });
          filter();
        });
      });
      filter();
    });
  }

  onReady(function () {
    setupNavigation();
    setupHeroCarousel();
    setupFilters();
  });
})();

function setupMoviePlayer(config) {
  var video = document.getElementById(config.videoId);
  var button = document.getElementById(config.buttonId);
  var hlsInstance = null;
  var loaded = false;

  if (!video || !button || !config.streamUrl) {
    return;
  }

  function loadVideo() {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = config.streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true });
      hlsInstance.loadSource(config.streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = config.streamUrl;
    }
  }

  function playVideo() {
    loadVideo();
    button.classList.add("is-hidden");
    video.controls = true;
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        button.classList.remove("is-hidden");
      });
    }
  }

  button.addEventListener("click", playVideo);
  video.addEventListener("click", function () {
    if (!loaded || video.paused) {
      playVideo();
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
