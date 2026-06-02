(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-main-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupImageFallbacks() {
    document.querySelectorAll(".poster-shell img").forEach(function (img) {
      img.addEventListener("error", function () {
        var shell = img.closest(".poster-shell");
        if (shell) {
          shell.classList.add("is-missing");
        }
      });
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length || !dots.length) {
      return;
    }
    var index = 0;

    function show(nextIndex) {
      index = nextIndex % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 4800);
  }

  function setupFilters() {
    var panels = document.querySelectorAll("[data-filter-panel]");
    panels.forEach(function (panel) {
      var scope = panel.closest("main") || document;
      var input = panel.querySelector("[data-search-input]");
      var region = panel.querySelector("[data-region-filter]");
      var type = panel.querySelector("[data-type-filter]");
      var sort = panel.querySelector("[data-sort-select]");
      var list = scope.querySelector("[data-card-list]");
      var cards = list ? Array.prototype.slice.call(list.querySelectorAll("[data-card]")) : [];
      var noResult = scope.querySelector("[data-no-result]");

      function getText(card) {
        return [
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.genre
        ].join(" ").toLowerCase();
      }

      function apply() {
        var keyword = input ? input.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value : "";
        var typeValue = type ? type.value : "";
        var visibleCount = 0;

        cards.forEach(function (card) {
          var matchedKeyword = !keyword || getText(card).indexOf(keyword) !== -1;
          var matchedRegion = !regionValue || card.dataset.region === regionValue;
          var matchedType = !typeValue || card.dataset.type === typeValue;
          var matched = matchedKeyword && matchedRegion && matchedType;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visibleCount += 1;
          }
        });

        if (noResult) {
          noResult.style.display = visibleCount ? "none" : "block";
        }
      }

      function sortCards() {
        if (!list || !sort) {
          return;
        }
        var value = sort.value;
        cards.sort(function (a, b) {
          if (value === "year-asc") {
            return Number(a.dataset.year) - Number(b.dataset.year);
          }
          if (value === "score-desc") {
            return Number(b.dataset.score) - Number(a.dataset.score);
          }
          if (value === "title-asc") {
            return String(a.dataset.title).localeCompare(String(b.dataset.title), "zh-Hans-CN");
          }
          return Number(b.dataset.year) - Number(a.dataset.year);
        });
        cards.forEach(function (card) {
          list.appendChild(card);
        });
        apply();
      }

      [input, region, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
      if (sort) {
        sort.addEventListener("change", sortCards);
        sortCards();
      } else {
        apply();
      }
    });
  }

  function setupPlayer() {
    var button = document.querySelector("[data-play-button]");
    var video = document.querySelector("[data-video-player]");
    var message = document.querySelector("[data-player-message]");
    var overlay = document.querySelector("[data-play-overlay]");
    if (!button || !video) {
      return;
    }

    button.addEventListener("click", function () {
      var source = button.dataset.videoUrl || "";
      if (!source) {
        if (message) {
          message.textContent = "当前影片未绑定播放源。";
        }
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls();
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play();
        });
        hls.on(window.Hls.Events.ERROR, function () {
          if (message) {
            message.textContent = "播放源连接异常，请检查网络或稍后重试。";
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", function () {
          video.play();
        }, { once: true });
      } else {
        if (message) {
          message.textContent = "当前浏览器需要 HLS 支持才能播放 m3u8 视频。";
        }
        return;
      }

      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      if (message) {
        message.textContent = "正在连接播放源，请稍候。";
      }
    });
  }

  ready(function () {
    setupMenu();
    setupImageFallbacks();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
