(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function getRoot() {
        return document.body.getAttribute("data-root") || "";
    }

    function setupMobileMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
            toggle.textContent = panel.classList.contains("is-open") ? "×" : "☰";
        });
    }

    function setupGlobalSearch() {
        var forms = document.querySelectorAll("[data-global-search]");
        forms.forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input[name='q']");
                var query = input ? input.value.trim() : "";
                var target = getRoot() + "search.html";
                if (query) {
                    target += "?q=" + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length <= 1) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function restart(index) {
            if (timer) {
                window.clearInterval(timer);
            }
            show(index);
            start();
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                restart(Number(dot.getAttribute("data-hero-dot")) || 0);
            });
        });

        show(0);
        start();
    }

    function setupImageFallbacks() {
        var images = document.querySelectorAll("img[data-cover]");
        images.forEach(function (img) {
            function markMissing() {
                var frame = img.closest(".poster-frame, .hero-media, .detail-poster");
                if (frame) {
                    frame.classList.add("cover-missing");
                }
                img.style.display = "none";
            }
            img.addEventListener("error", markMissing);
            if (img.complete && img.naturalWidth === 0) {
                markMissing();
            }
        });
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupCardFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        var container = document.querySelector("[data-card-container]");
        if (!panel || !container) {
            return;
        }
        var input = panel.querySelector("[data-filter-input]");
        var region = panel.querySelector("[data-filter-region]");
        var year = panel.querySelector("[data-filter-year]");
        var type = panel.querySelector("[data-filter-type]");
        var count = panel.querySelector("[data-filter-count]");
        var cards = Array.prototype.slice.call(container.querySelectorAll("[data-card]"));

        function apply() {
            var keyword = normalize(input && input.value);
            var regionValue = region ? region.value : "";
            var yearValue = year ? year.value : "";
            var typeValue = type ? type.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-genre"),
                    card.textContent
                ].join(" "));
                var ok = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    ok = false;
                }
                if (regionValue && card.getAttribute("data-region") !== regionValue) {
                    ok = false;
                }
                if (yearValue && card.getAttribute("data-year") !== yearValue) {
                    ok = false;
                }
                if (typeValue && card.getAttribute("data-type") !== typeValue) {
                    ok = false;
                }
                card.classList.toggle("is-hidden", !ok);
                if (ok) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = String(visible);
            }
        }

        [input, region, year, type].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    function createResultCard(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return [
            '<article class="movie-card">',
            '    <a href="' + escapeHtml(movie.url) + '" class="card-cover" aria-label="观看 ' + escapeHtml(movie.title) + '">',
            '        <div class="poster-frame" data-title="' + escapeHtml(movie.title) + '">',
            '            <img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" data-cover>',
            '        </div>',
            '        <span class="play-badge">▶</span>',
            '        <span class="score-badge">' + escapeHtml(movie.score) + '</span>',
            '    </a>',
            '    <div class="card-body">',
            '        <div class="card-meta">',
            '            <a href="' + escapeHtml(movie.categoryUrl) + '">' + escapeHtml(movie.category) + '</a>',
            '            <span>' + escapeHtml(movie.year) + '</span>',
            '        </div>',
            '        <h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>',
            '        <p>' + escapeHtml(movie.oneLine) + '</p>',
            '        <div class="tag-row">' + tags + '</div>',
            '    </div>',
            '</article>'
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>'"]/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                "\"": "&quot;"
            }[char];
        });
    }

    function setupSearchPage() {
        var input = document.querySelector("[data-search-page-input]");
        var button = document.querySelector("[data-search-page-button]");
        var results = document.querySelector("[data-search-results]");
        var summary = document.querySelector("[data-search-summary]");
        var data = window.MOVIE_SEARCH_DATA || [];
        if (!input || !results || !summary || !data.length) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;

        function run() {
            var query = normalize(input.value);
            var matches = data.filter(function (movie) {
                if (!query) {
                    return true;
                }
                return normalize(movie.searchText).indexOf(query) !== -1;
            });
            var limited = matches.slice(0, 120);
            results.innerHTML = limited.map(createResultCard).join("");
            setupImageFallbacks();
            summary.textContent = query
                ? "找到 " + matches.length + " 部相关影片，当前显示前 " + limited.length + " 部。"
                : "当前显示热度靠前的 " + limited.length + " 部影片，可输入关键词继续筛选。";
        }

        input.addEventListener("input", run);
        if (button) {
            button.addEventListener("click", run);
        }
        run();
    }

    function setupHlsPlayers() {
        var players = document.querySelectorAll("[data-player]");
        players.forEach(function (player) {
            var video = player.querySelector("[data-hls-player]");
            var button = player.querySelector("[data-play-button]");
            if (!video || !button) {
                return;
            }
            var hlsInstance = null;
            var loaded = false;
            var loading = false;

            function showError(message) {
                button.classList.remove("is-hidden");
                button.innerHTML = "<strong>" + escapeHtml(message) + "</strong><em>请稍后重试</em>";
            }

            function startPlayback() {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {
                        button.classList.remove("is-hidden");
                    });
                }
            }

            function loadSource() {
                if (loaded) {
                    startPlayback();
                    return;
                }
                if (loading) {
                    return;
                }
                loading = true;
                var source = video.getAttribute("data-src");
                var hlsModule = video.getAttribute("data-hls-module") || "./assets/hls.mjs";
                if (!source) {
                    showError("播放源缺失");
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    loaded = true;
                    loading = false;
                    startPlayback();
                    return;
                }

                import(new URL(hlsModule, window.location.href).href).then(function (module) {
                    var Hls = module.H || module.default || window.Hls;
                    if (!Hls || !Hls.isSupported()) {
                        showError("当前浏览器不支持 HLS");
                        loading = false;
                        return;
                    }
                    hlsInstance = new Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                        loaded = true;
                        loading = false;
                        startPlayback();
                    });
                    hlsInstance.on(Hls.Events.ERROR, function (event, data) {
                        if (data && data.fatal) {
                            loading = false;
                            showError("播放加载失败");
                            if (hlsInstance) {
                                hlsInstance.destroy();
                                hlsInstance = null;
                            }
                        }
                    });
                }).catch(function () {
                    loading = false;
                    showError("播放器初始化失败");
                });
            }

            button.addEventListener("click", function () {
                button.classList.add("is-hidden");
                loadSource();
            });
            video.addEventListener("play", function () {
                button.classList.add("is-hidden");
            });
            video.addEventListener("pause", function () {
                if (!video.ended) {
                    button.classList.remove("is-hidden");
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupGlobalSearch();
        setupHero();
        setupImageFallbacks();
        setupCardFilters();
        setupSearchPage();
        setupHlsPlayers();
    });
}());
