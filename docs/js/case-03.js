/* Case 03: scroll reveals, cover parallax fallback, stage index, exhibit reveals. */
(function () {
  'use strict';
  var hasIO = 'IntersectionObserver' in window;
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var ioOK = hasIO && !reduce;
  var root = document.querySelector('[data-fx-root]');
  if (!root) return;

  /* Site-wide scroll reveal (opacity only, once). Elements already in view stay visible. */
  if (ioOK) {
    requestAnimationFrame(function () {
      var els = root.querySelectorAll('section[aria-label="At a glance"], section[id]:not(#contact) > *:not([aria-label="Cover image"]), section:not([id]):not([aria-label]) > *, .ft-in');
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) { e.target.setAttribute('data-fx', 'in'); io.unobserve(e.target); }
        });
      }, { rootMargin: '0px 0px -24% 0px', threshold: 0 });
      els.forEach(function (t) {
        if (t.getBoundingClientRect().top < window.innerHeight * 0.76) return;
        t.setAttribute('data-fx', 'wait');
        io.observe(t);
      });
    });
  }

  /* Cover parallax: JS fallback when scroll-driven animations are unsupported. */
  var px = root.querySelector('[data-px]');
  var supportsTimeline = !!(window.CSS && CSS.supports && CSS.supports('animation-timeline: view()'));
  if (px && !reduce && !supportsTimeline) {
    var pl = px.querySelector('.px-l'), pr = px.querySelector('.px-r');
    var raf = 0, lastL = 0, lastR = 100;
    var apply = function (L, R, lb, rb) {
      pl.style.top = 'calc(' + L + '% + 16px - ' + (L * 0.32).toFixed(1) + 'px)';
      pl.style.transform = 'translateY(-' + L + '%)';
      pl.style.filter = 'brightness(' + lb + ')';
      pr.style.top = 'calc(' + R + '% + 16px - ' + (R * 0.32).toFixed(1) + 'px)';
      pr.style.transform = 'translateY(-' + R + '%)';
      pr.style.filter = 'brightness(' + rb + ')';
    };
    var tick = function () {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var y = window.scrollY || (document.scrollingElement && document.scrollingElement.scrollTop) || 0;
        var t = Math.max(0, Math.min(1, y / 700));
        var L = Math.round(100 * t), R = 100 - L;
        if (L !== lastL || R !== lastR) {
          lastL = L; lastR = R;
          apply(L, R, (1 - 0.55 * t).toFixed(2), (0.45 + 0.55 * t).toFixed(2));
        }
      });
    };
    document.addEventListener('scroll', tick, { passive: true, capture: true });
    window.addEventListener('resize', tick, { passive: true });
    tick();
  }

  /* One-shot watchers: moves (15% visible) and Exhibit B markers (35% visible). */
  var moves = root.querySelectorAll('.mv');
  var markers = root.querySelectorAll('.mk');
  var movesIn = function () { moves.forEach(function (m) { m.classList.remove('pre'); m.classList.add('on'); }); };
  var markersIn = function () { markers.forEach(function (m) { m.classList.add('on'); }); };
  var watch = function (el, ratio, done) {
    if (!el) return;
    if (!ioOK) { done(); return; }
    var o = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { done(); o.disconnect(); } });
    }, { threshold: ratio });
    o.observe(el);
  };
  watch(root.querySelector('[data-moves]'), 0.15, movesIn);
  watch(root.querySelector('[data-exhibit]'), 0.35, markersIn);

  /* Exhibit A sequence: armed when 40% in view. */
  var map = root.querySelector('[data-map]');
  if (map) {
    var arm = function () { map.classList.remove('rv-wait'); map.classList.add('rv-armed'); };
    if (!ioOK) arm();
    else {
      var mio = new IntersectionObserver(function (es) {
        if (es.some(function (e) { return e.isIntersecting; })) { arm(); mio.disconnect(); }
      }, { threshold: 0.4 });
      mio.observe(map);
    }
  }

  /* Stage index (fixed left index + sticky bar). */
  var order = ['discover', 'design', 'validate', 'ship'];
  var setStage = function (id) {
    var cur = Math.max(0, order.indexOf(id));
    order.forEach(function (k, i) {
      var on = i === cur, done = i < cur;
      var sc = on ? '#c2321d' : (done ? '#16181d' : '#5f6670');
      var sb = on ? '#e0402a' : (done ? '#16181d' : '#5f6670');
      var sd = on ? '#e0402a' : (done ? '#16181d' : 'transparent');
      var su = on ? '#e0402a' : 'transparent';
      document.querySelectorAll('.stg-idx a[href="#' + k + '"], .stg-items a[href="#' + k + '"]').forEach(function (a) {
        a.style.color = sc;
        var dot = a.querySelector('span[aria-hidden="true"]');
        if (dot) { dot.style.borderColor = sb; dot.style.background = sd; }
        var lbl = a.querySelector('.idx-lbl');
        if (lbl) lbl.style.opacity = on ? 1 : 0;
        if (a.hasAttribute('data-on')) { a.setAttribute('data-on', on ? '1' : '0'); a.style.borderBottomColor = su; }
      });
    });
  };
  if (hasIO) {
    var stage = 'discover';
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && stage !== e.target.id) { stage = e.target.id; setStage(stage); }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    root.querySelectorAll('[data-stage]').forEach(function (s) { sio.observe(s); });
  }
})();
