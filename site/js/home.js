/* Home page behaviour (ported from the x-dc component in Home.dc.html). */
(function () {
  'use strict';
  var hasIO = 'IntersectionObserver' in window;
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* Scroll reveal (fxRoot): opacity fade once, elements already in view stay visible. */
  if (hasIO && !reduce) {
    requestAnimationFrame(function () {
      var els = document.querySelectorAll('#archive > div:first-child, #pim, #case-04, .wip-box, #method-h, .method-grid > li, #subject-h, #record-h, .rec-row, .rec-status, .ft-in');
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

  /* PIM case tiles: hover/focus marks the tile's number as active. */
  var cards = document.querySelectorAll('[data-card]');
  function setActive(card) {
    cards.forEach(function (c) {
      var num = c.querySelector('[data-card-num]');
      if (num) num.style.color = c === card ? '#16181d' : '#5f6670';
    });
  }
  cards.forEach(function (c) {
    c.addEventListener('mouseenter', function () { setActive(c); });
    c.addEventListener('focus', function () { setActive(c); });
  });

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
