/* Home page behaviour (ported from the x-dc component in Home.dc.html). */
(function () {
  'use strict';
  var hasIO = 'IntersectionObserver' in window;
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* Scroll reveal (fxRoot): opacity fade once, elements already in view stay visible. */
  if (hasIO && !reduce) {
    requestAnimationFrame(function () {
      var els = document.querySelectorAll('#archive > div:first-child, .case-card, #case-04, .wip-box, #method-h, .method-grid > li, #subject-h, #record-h, .rec-row, .rec-status, .ft-in');
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

  /* Section index (secRef): highlight the section crossing the middle of the viewport. */
  var idxLinks = document.querySelectorAll('[data-idx-link]');
  function setSec(id) {
    idxLinks.forEach(function (a) {
      var on = a.getAttribute('data-idx-link') === id;
      var dot = a.children[0], lbl = a.children[1];
      a.style.color = on ? '#c2321d' : '#5f6670';
      dot.style.borderColor = on ? '#e0402a' : '#5f6670';
      dot.style.background = on ? '#e0402a' : 'transparent';
      lbl.style.opacity = on ? '1' : '0';
    });
  }
  if (hasIO && idxLinks.length) {
    var cur = 'top';
    var io3 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && cur !== e.target.id) { cur = e.target.id; setSec(cur); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('[data-sec]').forEach(function (el) { io3.observe(el); });
  }


  /* Subject file (subjRef): personnel card and Webtoon polaroid settle in once at 15% visible. */
  var subj = document.querySelector('[data-subj]');
  if (subj && hasIO && !reduce) {
    var card = subj.querySelector('.pn-card');
    var pol = subj.querySelector('.pn-pol');
    var ease = 'cubic-bezier(.2,.8,.2,1)';
    if (card && pol) {
      card.style.transition = 'none'; pol.style.transition = 'none';
      card.style.opacity = '0'; card.style.transform = 'rotate(1.5deg) translateY(18px)';
      pol.style.opacity = '0'; pol.style.transform = 'rotate(7deg) translateY(24px)';
      void card.offsetWidth;
      card.style.transition = 'opacity .5s ease, transform .9s ' + ease;
      pol.style.transition = 'opacity .5s ease .3s, transform .9s ' + ease + ' .3s';
      var io2 = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) {
          card.style.opacity = '1'; card.style.transform = 'rotate(-1deg) translateY(0)';
          pol.style.opacity = '1'; pol.style.transform = 'rotate(2deg) translateY(0)';
          io2.disconnect();
        }
      }, { threshold: 0.15 });
      io2.observe(subj);
    }
  }
})();

/* Hero magnifying lens: mouse only, off for touch and reduced motion. */
(function () {
  'use strict';
  var top = document.getElementById('top');
  if (!top || !window.matchMedia) return;
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var src = top.firstElementChild, Z = 1.75, wrap, lens, clone, x = 0, y = 0, raf = 0;

  function build() {
    wrap = document.createElement('div'); wrap.className = 'lens-wrap'; wrap.setAttribute('aria-hidden', 'true');
    lens = document.createElement('div'); lens.className = 'lens';
    var handle = document.createElement('div'); handle.className = 'lens-handle';
    clone = src.cloneNode(true); clone.classList.add('lens-clone'); clone.setAttribute('inert', '');
    var cs = getComputedStyle(src); /* the hero inherits its type from a wrapper; the lens lives outside it */
    ['fontFamily', 'fontSize', 'fontStretch', 'fontWeight', 'lineHeight', 'letterSpacing', 'color'].forEach(function (k) { clone.style[k] = cs[k]; });
    clone.removeAttribute('id');
    clone.querySelectorAll('[id]').forEach(function (e) { e.removeAttribute('id'); });
    lens.appendChild(clone); wrap.appendChild(lens); wrap.appendChild(handle);
    document.body.appendChild(wrap);
  }
  function sync() { /* keep the magnified footprints in step with the real ones */
    var o = src.querySelectorAll('.fp'), c = clone.querySelectorAll('.fp');
    o.forEach(function (e, i) {
      if (!e.getAnimations || !c[i]) return;
      var a = e.getAnimations()[0], b = c[i].getAnimations()[0];
      if (a && b && a.currentTime != null) b.currentTime = a.currentTime;
    });
  }
  function draw() {
    raf = 0;
    var r = src.getBoundingClientRect(), s = top.getBoundingClientRect();
    var half = wrap.offsetWidth / 2, c = lens.clientWidth / 2, b = (lens.offsetWidth - lens.clientWidth) / 2;
    wrap.style.transform = 'translate(' + (x - half) + 'px,' + (y - half) + 'px)';
    clone.style.width = r.width + 'px';
    clone.style.left = ((r.left - x) * Z + c) + 'px';
    clone.style.top = ((r.top - y) * Z + c) + 'px';
    clone.style.transform = 'scale(' + Z + ')';
    lens.style.backgroundSize = (32 * Z) + 'px ' + (32 * Z) + 'px';
    lens.style.backgroundPosition = ((s.left - x) * Z + c) + 'px ' + ((s.top - y) * Z + c) + 'px';
    var el = document.elementFromPoint(x, y);
    wrap.classList.toggle('hot', !!(el && el.closest && el.closest('a,button')));
    void b;
  }
  function show() {
    if (!wrap) build();
    if (!wrap.classList.contains('on')) { wrap.classList.add('on'); top.classList.add('lens-active'); sync(); }
    if (!raf) raf = requestAnimationFrame(draw);
  }
  function hide() { if (wrap) { wrap.classList.remove('on'); top.classList.remove('lens-active'); } }
  top.addEventListener('pointermove', function (e) {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    if (document.documentElement.classList.contains('env-on')) return;
    x = e.clientX; y = e.clientY; show();
  });
  top.addEventListener('pointerleave', hide);
  window.addEventListener('scroll', function () {
    if (!wrap || !wrap.classList.contains('on')) return;
    var s = top.getBoundingClientRect();
    if (y < s.top || y > s.bottom) hide(); else if (!raf) raf = requestAnimationFrame(draw);
  }, { passive: true });
})();
