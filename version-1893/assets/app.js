(function () {
  var menuButton = document.querySelector("[data-menu-toggle]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      mobilePanel.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 6500);
    }
  }

  var filterInput = document.querySelector("[data-filter-input]");
  var yearFilter = document.querySelector("[data-year-filter]");
  var filterList = document.querySelector("[data-filter-list]");

  function runFilter() {
    if (!filterList) {
      return;
    }

    var keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
    var year = yearFilter ? yearFilter.value : "";
    var items = Array.prototype.slice.call(filterList.children);

    items.forEach(function (item) {
      var haystack = [
        item.getAttribute("data-title"),
        item.getAttribute("data-region"),
        item.getAttribute("data-genre"),
        item.textContent
      ].join(" ").toLowerCase();
      var itemYear = item.getAttribute("data-year") || item.textContent;
      var visible = (!keyword || haystack.indexOf(keyword) !== -1) && (!year || itemYear.indexOf(year) !== -1);
      item.style.display = visible ? "" : "none";
    });
  }

  if (filterInput) {
    filterInput.addEventListener("input", runFilter);
  }

  if (yearFilter) {
    yearFilter.addEventListener("change", runFilter);
  }
})();

function initPlayer(src) {
  var video = document.querySelector("[data-video]");
  var cover = document.querySelector("[data-play-cover]");
  var button = document.querySelector("[data-play-button]");
  var attached = false;

  if (!video || !src) {
    return;
  }

  function attach() {
    if (attached) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
    } else if (window.Hls && window.Hls.isSupported()) {
      video._hls = new window.Hls();
      video._hls.loadSource(src);
      video._hls.attachMedia(video);
    } else {
      video.src = src;
    }

    attached = true;
  }

  function start() {
    attach();

    if (cover) {
      cover.classList.add("is-hidden");
    }

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  if (button) {
    button.addEventListener("click", start);
  }

  if (cover) {
    cover.addEventListener("click", start);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    }
  });
}
