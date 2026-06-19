(function() {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function escapeHtml(value) {
    return (value || "").toString().replace(/[&<>"]/g, function(ch) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[ch];
    });
  }

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function() {
      var expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", expanded ? "false" : "true");
      panel.hidden = expanded;
      document.body.classList.toggle("is-menu-open", !expanded);
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        show(Number(dot.getAttribute("data-slide") || 0));
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function initFilters() {
    var scope = document.querySelector("[data-filter-scope]");
    if (!scope) {
      return;
    }
    var keyword = scope.querySelector(".filter-keyword");
    var year = scope.querySelector(".filter-year");
    var region = scope.querySelector(".filter-region");
    var grid = document.querySelector(".filter-grid");
    var empty = document.querySelector(".empty-state");
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

    function apply() {
      var q = normalize(keyword && keyword.value);
      var y = normalize(year && year.value);
      var r = normalize(region && region.value);
      var visible = 0;
      cards.forEach(function(card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre")
        ].join(" "));
        var ok = true;
        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (y && normalize(card.getAttribute("data-year")) !== y) {
          ok = false;
        }
        if (r && normalize(card.getAttribute("data-region")) !== r) {
          ok = false;
        }
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [keyword, year, region].forEach(function(el) {
      if (el) {
        el.addEventListener("input", apply);
        el.addEventListener("change", apply);
      }
    });
    apply();
  }

  function cardTemplate(item) {
    return "<article class=\"movie-card\" data-title=\"" + escapeHtml(item.title) + "\" data-year=\"" + escapeHtml(item.year) + "\" data-region=\"" + escapeHtml(item.region) + "\" data-genre=\"" + escapeHtml(item.genre) + "\">" +
      "<a class=\"card-link\" href=\"" + escapeHtml(item.url) + "\" aria-label=\"" + escapeHtml(item.title) + "\">" +
      "<div class=\"card-cover\"><img src=\"" + escapeHtml(item.image) + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\"><div class=\"card-shade\"></div><div class=\"score-pill\">★ " + escapeHtml(item.rating) + "</div><div class=\"play-pill\">▶</div></div>" +
      "<div class=\"card-body\"><div class=\"card-meta\"><span>" + escapeHtml(item.category) + "</span><span>" + escapeHtml(item.year) + "</span></div><h3>" + escapeHtml(item.title) + "</h3><p>" + escapeHtml(item.line) + "</p><div class=\"tag-row\"><span>" + escapeHtml(item.genre) + "</span></div></div>" +
      "</a></article>";
  }

  function initSearchPage() {
    var results = document.getElementById("search-results");
    var empty = document.getElementById("search-empty");
    var input = document.getElementById("search-input");
    if (!results || !window.SEARCH_INDEX) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input) {
      input.value = query;
    }
    var q = normalize(query);
    var matches = window.SEARCH_INDEX.filter(function(item) {
      if (!q) {
        return false;
      }
      return normalize([item.title, item.year, item.region, item.genre, item.tags, item.category, item.line].join(" ")).indexOf(q) !== -1;
    }).slice(0, 120);
    results.innerHTML = matches.map(cardTemplate).join("");
    if (empty) {
      empty.hidden = q ? matches.length !== 0 : true;
    }
  }

  ready(function() {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
  });
})();
