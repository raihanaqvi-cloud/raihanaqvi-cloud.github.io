/* Case 01: scroll reveals, moves/markers reveal, cover parallax fallback, stage index. */
(function () {
  'use strict';
  var hasIO = 'IntersectionObserver' in window;
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var ioOK = hasIO && !reduce;

  /* Site-wide opacity reveal (data-fx wait -> in) */
  var root = document.querySelector('[data-fx-root]');
  if (root && ioOK) {
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

  /* One-shot watchers: moves grid (15%) and exhibit markers (35%) */
  function watch(el, ratio, onIn) {
    var o = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { onIn(); o.disconnect(); } });
    }, { threshold: ratio });
    o.observe(el);
  }
  if (ioOK) {
    var mv = document.querySelector('[data-mv]');
    if (mv) {
      var moves = mv.querySelectorAll('.mv');
      moves.forEach(function (m) { m.classList.remove('on'); m.classList.add('pre'); });
      watch(mv, 0.15, function () {
        moves.forEach(function (m) { m.classList.remove('pre'); m.classList.add('on'); });
      });
    }
    var ex = document.querySelector('[data-ex]');
    if (ex) {
      var mks = ex.querySelectorAll('.mk');
      mks.forEach(function (m) { m.classList.remove('on'); });
      watch(ex, 0.35, function () { mks.forEach(function (m) { m.classList.add('on'); }); });
    }
  }

  /* Cover parallax: JS fallback when scroll-driven animations are unsupported */
  var pxL = document.querySelector('.px-l');
  var pxR = document.querySelector('.px-r');
  var cssTimeline = window.CSS && CSS.supports && CSS.supports('animation-timeline: view()');
  if (pxL && pxR && !reduce && !cssTimeline) {
    var raf = 0, lastL = 0;
    var apply = function (L) {
      var R = 100 - L, t = L / 100;
      pxL.style.top = 'calc(' + L + '% + 16px - ' + (L * 0.32).toFixed(1) + 'px)';
      pxL.style.transform = 'translateY(-' + L + '%)';
      pxL.style.filter = 'brightness(' + (1 - 0.55 * t).toFixed(2) + ')';
      pxR.style.top = 'calc(' + R + '% + 16px - ' + (R * 0.32).toFixed(1) + 'px)';
      pxR.style.transform = 'translateY(-' + R + '%)';
      pxR.style.filter = 'brightness(' + (0.45 + 0.55 * t).toFixed(2) + ')';
    };
    var tick = function () {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var y = window.scrollY || (document.scrollingElement && document.scrollingElement.scrollTop) || 0;
        var t = Math.max(0, Math.min(1, y / 700));
        var L = Math.round(100 * t);
        if (L !== lastL) { lastL = L; apply(L); }
      });
    };
    document.addEventListener('scroll', tick, { passive: true, capture: true });
    window.addEventListener('resize', tick, { passive: true });
    tick();
  }

  /* Stage index (left rail + sticky bar) */
  var order = ['discover', 'design', 'validate', 'ship'];
  var stage = 'discover';
  var links = document.querySelectorAll('.stg-idx a[href^="#"], .stg-items a[href^="#"]');
  function render() {
    var cur = order.indexOf(stage);
    links.forEach(function (a) {
      var k = a.getAttribute('href').slice(1), i = order.indexOf(k);
      if (i < 0) return;
      var on = i === cur, done = i < cur;
      a.style.color = on ? '#c2321d' : (done ? '#16181d' : '#5f6670');
      var dot = a.querySelector('span[aria-hidden="true"]');
      if (dot) {
        dot.style.borderColor = on ? '#e0402a' : (done ? '#16181d' : '#5f6670');
        dot.style.background = on ? '#e0402a' : (done ? '#16181d' : 'transparent');
      }
      var lbl = a.querySelector('.idx-lbl');
      if (lbl) lbl.style.opacity = on ? 1 : 0;
      if (a.closest('.stg-items')) {
        a.setAttribute('data-on', on ? '1' : '0');
        a.style.borderBottomColor = on ? '#e0402a' : 'transparent';
      }
    });
  }
  if (hasIO) {
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && stage !== e.target.id) { stage = e.target.id; render(); }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    order.forEach(function (id) { var s = document.getElementById(id); if (s) sio.observe(s); });
  }
})();
