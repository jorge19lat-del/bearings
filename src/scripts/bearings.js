/* BEARINGS — the small amount of behaviour the site actually needs. */
(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* The masthead wordmark stays out of the way until the opening has passed. */
  if (document.body.classList.contains("is-home")) {
    var opening = document.querySelector(".opening");
    var onScroll = function () {
      var past = opening ? window.scrollY > opening.offsetHeight * 0.5 : window.scrollY > 200;
      document.body.classList.toggle("is-scrolled", past);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* Photographs arrive rather than appear. Writing is never hidden; anything
     already on screen is shown at once; and a failsafe clears the state if
     the observer is ever prevented from doing its work. */
  if ("IntersectionObserver" in window && !reduced) {
    var figures = document.querySelectorAll(".figure");
    var show = function (el) { el.classList.add("is-visible"); };
    var showAll = function () {
      Array.prototype.forEach.call(document.querySelectorAll(".figure.reveal"), show);
    };

    var waiting = [];
    Array.prototype.forEach.call(figures, function (el) {
      el.classList.add("reveal");
      if (el.getBoundingClientRect().top < window.innerHeight * 1.25) show(el);
      else waiting.push(el);
    });

    var revealer = new IntersectionObserver(
      function (items) {
        items.forEach(function (item) {
          if (item.isIntersecting) {
            show(item.target);
            revealer.unobserve(item.target);
          }
        });
      },
      { rootMargin: "240px 0px 0px 0px", threshold: 0 }
    );
    waiting.forEach(function (el) { revealer.observe(el); });

    window.setTimeout(showAll, 2500);
    window.addEventListener("beforeprint", showAll);
  }

  /* Which section of an entry is being read. */
  var marginLinks = document.querySelectorAll(".margin-index a[data-target]");
  if (marginLinks.length && "IntersectionObserver" in window) {
    var sections = [];
    Array.prototype.forEach.call(marginLinks, function (link) {
      var section = document.getElementById(link.getAttribute("data-target"));
      if (section) sections.push({ link: link, section: section });
    });

    var mark = function (id) {
      sections.forEach(function (pair) {
        pair.link.classList.toggle("is-current", pair.section.id === id);
      });
    };

    var spy = new IntersectionObserver(
      function (items) {
        items.forEach(function (item) {
          if (item.isIntersecting) mark(item.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    sections.forEach(function (pair) { spy.observe(pair.section); });
  }
})();
