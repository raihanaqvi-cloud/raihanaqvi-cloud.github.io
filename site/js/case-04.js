/* Case 04 page behaviour: a vanilla port of the design canvas logic. */
(function () {
  'use strict';
  var hasIO = 'IntersectionObserver' in window;
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var ioOK = hasIO && !reduce;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---- Hidden-until-revealed states (HTML ships the revealed state for no-JS / reduced motion) ---- */
  var discover = document.getElementById('discover');
  var eqEl = $('[data-eq]');
  var pmEls = $$('.pm-plus, .pm');
  var mks = $$('.mk');
  if (ioOK) {
    // Switch to the waiting state without animating the hide.
    var freeze = document.createElement('style');
    freeze.textContent = '*,*::before,*::after{transition:none !important}';
    document.head.appendChild(freeze);
    if (discover) { discover.classList.remove('hiw-go'); discover.classList.add('hiw-wait'); }
    if (eqEl) { eqEl.classList.remove('eq-go'); eqEl.classList.add('eq-wait'); }
    pmEls.forEach(function (el) { el.classList.remove('pm-go'); el.classList.add('pm-wait'); });
    mks.forEach(function (el) { el.classList.remove('on'); });
    void document.body.offsetHeight;
    document.head.removeChild(freeze);
  }

  /* ---- Site-wide scroll reveal (fxRoot) ---- */
  var root = $('[data-fxroot]');
  if (root && ioOK) {
    requestAnimationFrame(function () {
      var els = root.querySelectorAll('section[aria-label="At a glance"], section[id]:not(#contact) > *:not([aria-label="Cover image"]), section:not([id]):not([aria-label]) > *, .ft-in');
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.setAttribute('data-fx', 'in'); io.unobserve(e.target); } });
      }, { rootMargin: '0px 0px -24% 0px', threshold: 0 });
      Array.prototype.forEach.call(els, function (t) {
        if (t.getBoundingClientRect().top < window.innerHeight * 0.76) return;
        t.setAttribute('data-fx', 'wait');
        io.observe(t);
      });
    });
  }

  /* ---- Stage index (works whenever IO exists, motion or not) ---- */
  var order = ['discover', 'design', 'test', 'ship'];
  var stage = 'discover';
  function paintStages() {
    var cur = order.indexOf(stage);
    order.forEach(function (k, i) {
      var on = i === cur, done = i < cur;
      var sc = on ? '#c2321d' : (done ? '#16181d' : '#5f6670');
      var sb = on ? '#e0402a' : (done ? '#16181d' : '#5f6670');
      var sd = on ? '#e0402a' : (done ? '#16181d' : 'transparent');
      var su = on ? '#e0402a' : 'transparent';
      $$('.stg-idx a[href="#' + k + '"], .stg-items a[href="#' + k + '"]').forEach(function (a) {
        a.style.color = sc;
        var dot = a.querySelector('span[aria-hidden="true"]');
        if (dot) { dot.style.borderColor = sb; dot.style.background = sd; }
        var lbl = a.querySelector('.idx-lbl');
        if (lbl) lbl.style.opacity = on ? 1 : 0;
        if (a.closest('.stg-items')) { a.setAttribute('data-on', on ? '1' : '0'); a.style.borderBottomColor = su; }
      });
    });
  }
  if (hasIO) {
    var stIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && stage !== e.target.id) { stage = e.target.id; paintStages(); }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    order.forEach(function (id) { var el = document.getElementById(id); if (el) stIO.observe(el); });
  }

  /* ---- Cover parallax fallback (when scroll-driven animations are unsupported) ---- */
  var px = $('[data-px]');
  if (px && !reduce && !(window.CSS && CSS.supports && CSS.supports('animation-timeline: view()'))) {
    var pl = $('.px-l', px), pr = $('.px-r', px), pxRaf = 0, lastL = 0, lastR = 100;
    var tick = function () {
      if (pxRaf) return;
      pxRaf = requestAnimationFrame(function () {
        pxRaf = 0;
        var y = window.scrollY || (document.scrollingElement && document.scrollingElement.scrollTop) || 0;
        var t = Math.max(0, Math.min(1, y / 700));
        var L = Math.round(100 * t), R = 100 - L;
        if (L === lastL && R === lastR) return;
        lastL = L; lastR = R;
        if (pl) {
          pl.style.top = 'calc(' + L + '% + 16px - ' + (L * 0.32).toFixed(1) + 'px)';
          pl.style.transform = 'translateY(-' + L + '%)';
          pl.style.filter = 'brightness(' + (1 - 0.55 * t).toFixed(2) + ')';
        }
        if (pr) {
          pr.style.top = 'calc(' + R + '% + 16px - ' + (R * 0.32).toFixed(1) + 'px)';
          pr.style.transform = 'translateY(-' + R + '%)';
          pr.style.filter = 'brightness(' + (0.45 + 0.55 * t).toFixed(2) + ')';
        }
      });
    };
    document.addEventListener('scroll', tick, { passive: true, capture: true });
    window.addEventListener('resize', tick, { passive: true });
    tick();
  }

  /* ---- Exhibit A: red-pen X once the panel is fully in view ---- */
  var hiw = $('[data-hiw]');
  if (hiw && ioOK && discover) {
    var xo = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var need = Math.min(0.98, (window.innerHeight * 0.95) / Math.max(1, e.boundingClientRect.height));
        if (e.isIntersecting && e.intersectionRatio >= need) {
          discover.classList.remove('hiw-wait'); discover.classList.add('hiw-go');
          xo.disconnect();
        }
      });
    }, { threshold: [0, 0.25, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 0.98, 1] });
    xo.observe(hiw);
  }

  /* ---- One-shot reveals: vertical sum, moves 04-05, Exhibit C markers ---- */
  function once(el, opts, fn) {
    if (!el || !ioOK) return;
    var o = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { fn(); o.disconnect(); } });
    }, opts);
    o.observe(el);
  }
  once(eqEl, { rootMargin: '0px 0px -24% 0px', threshold: 0 }, function () {
    eqEl.classList.remove('eq-wait'); eqEl.classList.add('eq-go');
  });
  once($('[data-pm]'), { rootMargin: '0px 0px -24% 0px', threshold: 0 }, function () {
    pmEls.forEach(function (el) { el.classList.remove('pm-wait'); el.classList.add('pm-go'); });
  });
  once($('[data-ex]'), { threshold: 0.35 }, function () {
    mks.forEach(function (el) { el.classList.add('on'); });
  });

  /* ---- Exhibit B: area list + screen carousel with autoplay ---- */
  var ap = $('[data-ap]');
  if (ap) {
    var shotN = { 1: 3, 2: 3, 3: 3 };
    var shotCaps = { 1: ['BASIC INFORMATION', 'CHECK PARAMETERS', 'CONDITIONS (OPTIONAL)'], 2: ['SELECT STANDARDS', 'BATCH OR MANUAL', 'SELECT DOCUMENTS'], 3: ['NAME & STANDARDS', 'SELECT RULES', 'SELECT DOCUMENTS'] };
    var tab = 1, si = 0, apT = 0, apUserPaused = false, apVis = false;
    var tabs = $$('[data-tab]', ap), shots = $$('[data-shot]', ap);
    var label = $('[data-shot-label]', ap), toggle = $('[data-ap-toggle]', ap);

    var render = function () {
      tabs.forEach(function (b) {
        var n = +b.getAttribute('data-tab'), on = n === tab;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        var bar = b.querySelector('.rs-prog > span');
        if (bar) bar.style.width = on ? ((si + 1) / shotN[n] * 100) + '%' : '0%';
      });
      shots.forEach(function (el) { el.classList.toggle('on', el.getAttribute('data-shot') === tab + '-' + si); });
      if (label) label.textContent = (si + 1) + ' / ' + shotN[tab] + ' · ' + shotCaps[tab][si];
      if (toggle) {
        toggle.textContent = apUserPaused ? '▶' : '❚❚';
        toggle.setAttribute('aria-label', apUserPaused ? 'Play the screens' : 'Pause the screens');
      }
    };
    var apStep = function () {
      if (si + 1 < shotN[tab]) si += 1; else { tab = (tab % 3) + 1; si = 0; }
      render();
    };
    var apStart = function () { if (!ioOK || apT || apUserPaused || !apVis) return; apT = setInterval(apStep, 2400); };
    var apStop = function () { if (apT) { clearInterval(apT); apT = 0; } };
    var apReset = function () { apStop(); apStart(); };

    tabs.forEach(function (b) {
      b.addEventListener('click', function () { tab = +b.getAttribute('data-tab'); si = 0; render(); apReset(); });
    });
    var prev = $('[data-shot-prev]', ap), next = $('[data-shot-next]', ap);
    if (prev) prev.addEventListener('click', function () {
      if (si > 0) si -= 1; else { tab = tab === 1 ? 3 : tab - 1; si = shotN[tab] - 1; }
      render(); apReset();
    });
    if (next) next.addEventListener('click', function () { apStep(); apReset(); });
    if (toggle) toggle.addEventListener('click', function () {
      if (apUserPaused) { apUserPaused = false; render(); apStep(); apStart(); }
      else { apUserPaused = true; render(); apStop(); }
    });

    if (ioOK) {
      var apIO = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          apVis = e.isIntersecting && e.intersectionRatio >= 0.4;
          if (apVis) apStart(); else apStop();
        });
      }, { threshold: [0, 0.4, 0.6] });
      apIO.observe(ap);
    }
  }
})();
