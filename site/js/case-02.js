/* Case 02: scroll reveals, cover parallax fallback, stage index. */
(function () {
  'use strict';
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var hasIO = 'IntersectionObserver' in window;

  /* Scroll reveal: opacity-only fade, once, elements already in view stay visible. */
  function initReveal() {
    var root = document.querySelector('[data-fx-root]');
    if (!root || !hasIO || reduce) return;
    requestAnimationFrame(function () {
      var els = root.querySelectorAll('section[aria-label="At a glance"], section[id]:not(#contact) > *:not([aria-label="Cover image"]), section:not([id]):not([aria-label]) > *, .ft-in');
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { e.target.setAttribute('data-fx', 'in'); io.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -24% 0px', threshold: 0 });
      Array.prototype.forEach.call(els, function (t) {
        if (t.getBoundingClientRect().top < window.innerHeight * 0.76) return;
        t.setAttribute('data-fx', 'wait');
        io.observe(t);
      });
    });
  }

  /* Cover parallax: CSS scroll timelines handle it where supported; JS fallback otherwise. */
  function initParallax() {
    var tile = document.querySelector('[data-px]');
    if (!tile || reduce) return;
    if (window.CSS && CSS.supports && CSS.supports('animation-timeline: view()')) return;
    var l = tile.querySelector('[data-px-l]'), r = tile.querySelector('[data-px-r]');
    if (!l || !r) return;
    var raf = 0, lastL = 0;
    function apply() {
      raf = 0;
      var y = window.scrollY || (document.scrollingElement && document.scrollingElement.scrollTop) || 0;
      var t = Math.max(0, Math.min(1, y / 700));
      var L = Math.round(100 * t), R = 100 - L;
      if (L === lastL) return;
      lastL = L;
      l.style.top = 'calc(' + L + '% + 16px - ' + (L * 0.32).toFixed(1) + 'px)';
      l.style.transform = 'translateY(-' + L + '%)';
      l.style.filter = 'brightness(' + (1 - 0.55 * t).toFixed(2) + ')';
      r.style.top = 'calc(' + R + '% + 16px - ' + (R * 0.32).toFixed(1) + 'px)';
      r.style.transform = 'translateY(-' + R + '%)';
      r.style.filter = 'brightness(' + (0.45 + 0.55 * t).toFixed(2) + ')';
    }
    function tick() { if (!raf) raf = requestAnimationFrame(apply); }
    document.addEventListener('scroll', tick, { passive: true, capture: true });
    window.addEventListener('resize', tick, { passive: true });
    tick();
  }

  /* Stage index (fixed left index + sticky bar): highlights the section in the reading band. */
  function initStages() {
    var order = ['discover', 'design', 'ship'];
    var stage = 'discover';
    var links = document.querySelectorAll('[data-stage-link]');
    function render() {
      var cur = order.indexOf(stage);
      Array.prototype.forEach.call(links, function (a) {
        var i = order.indexOf(a.getAttribute('data-stage-link'));
        var on = i === cur, done = i < cur;
        a.style.color = on ? '#c2321d' : (done ? '#16181d' : '#5f6670');
        var dot = a.querySelector('[data-stage-dot]');
        if (dot) {
          dot.style.borderColor = on ? '#e0402a' : (done ? '#16181d' : '#5f6670');
          dot.style.background = on ? '#e0402a' : (done ? '#16181d' : 'transparent');
        }
        var lbl = a.querySelector('.idx-lbl');
        if (lbl) lbl.style.opacity = on ? '1' : '0';
        if (a.hasAttribute('data-on')) {
          a.setAttribute('data-on', on ? '1' : '0');
          a.style.borderBottomColor = on ? '#e0402a' : 'transparent';
        }
      });
    }
    if (!hasIO) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && stage !== e.target.id) { stage = e.target.id; render(); }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    Array.prototype.forEach.call(document.querySelectorAll('section[data-stage]'), function (s) { io.observe(s); });
  }

  initReveal();
  initParallax();
  initStages();
})();
