/* core: GSAP setup, eases, media queries, scroll engine, line reveals, parallax, footer.
   Literal values from the pda.archi teardown (TEARDOWN.md modules 1, 6, 13, 25). */
(function () {
  'use strict';
  var HS = (window.HS = window.HS || {});
  HS.pages = {};
  HS.booted = false;
  if (!window.gsap) return;
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

  // GSAP custom eases (DmkCsKWL.js:27480)
  CustomEase.create('alpha', '.25,.46,.45,.9');
  CustomEase.create('gl.smoothInOut', '.5,0,0,1');
  CustomEase.create('gl.inOut', 'M0,0 C0.2,0 0,1 1,1');
  CustomEase.create('gl.quicky', 'M0,0 C0.094,0.026 0.124,0.127 0.157,0.29 0.197,0.486 0.245,0.831 0.348,0.906 0.431,0.966 0.374,1 1,1');
  CustomEase.create('gl.fastInOut', 'M0,0 C0.094,0.026 0.125,0.096 0.158,0.259 0.186,0.396 0.239,0.777 0.303,0.866 0.387,0.984 0.476,1 1,1');
  gsap.defaults({ ease: 'none' }); // global default ease is none (DmkCsKWL.js:27493)
  gsap.ticker.lagSmoothing(0);
  ScrollTrigger.config({ ignoreMobileResize: true });

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  HS.$ = $; HS.$$ = $$;

  // viewport helpers
  HS.mq = {
    reduce: matchMedia('(prefers-reduced-motion: reduce)'),
    coarse: matchMedia('(pointer: coarse)'),
    fine: matchMedia('(hover: hover) and (pointer: fine)'),
    xl: matchMedia('(min-width: 1280px)'),
    l1025: matchMedia('(min-width: 1025px)'),
    md: matchMedia('(min-width: 768px)')
  };
  HS.motion = function () { return !HS.mq.reduce.matches; };
  HS.isTouch = function () { return HS.mq.coarse.matches; };
  HS.rem = function (n) { return n * parseFloat(getComputedStyle(document.documentElement).fontSize); }; // Fi(n)
  HS.fontsReady = function () {
    var t = new Promise(function (r) { setTimeout(r, 1500); });
    return Promise.race([document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve(), t]);
  };

  // ---- scroll engine: Lenis, fine pointers only (deviation from the reference: phones keep native scroll) ----
  HS.initScroll = function () {
    if (HS.lenis || !window.Lenis || !HS.motion() || HS.isTouch()) return;
    var l = new Lenis({ easing: function (t) { return 1 - Math.pow(1 - t, 5); }, duration: 1, lerp: 0.1, smoothWheel: true, syncTouch: false, autoRaf: false });
    HS.lenis = l;
    l.on('scroll', ScrollTrigger.update);
    HS._tick = function (t) { l.raf(t * 1000); };
    gsap.ticker.add(HS._tick);
  };
  HS.destroyScroll = function () {
    if (!HS.lenis) return;
    gsap.ticker.remove(HS._tick);
    HS.lenis.destroy(); HS.lenis = null;
  };
  HS.scrollTo = function (y, immediate) {
    if (HS.lenis) HS.lenis.scrollTo(y, { immediate: !!immediate, force: true });
    else window.scrollTo(0, y);
  };
  HS._locks = 0;
  HS.lock = function (on) {
    HS._locks = Math.max(0, HS._locks + (on ? 1 : -1));
    var locked = HS._locks > 0;
    if (HS.lenis) { locked ? HS.lenis.stop() : HS.lenis.start(); }
    document.documentElement.classList.toggle('is-locked', locked);
  };

  // ---- lazy image fade ----
  HS.images = function (root) {
    $$('img.lazy', root).forEach(function (img) {
      if (img.complete && img.naturalWidth) { img.classList.add('is-loaded'); return; }
      img.addEventListener('load', function () { img.classList.add('is-loaded'); }, { once: true });
      img.addEventListener('error', function () { img.classList.add('is-loaded'); }, { once: true });
    });
  };

  // ---- masked line reveals (BZdlCJje.js:34 heading 1.2s / BpN8afLs.js:55 text 1s, expo.out, stagger .1) ----
  HS.splitLines = function (el, opts) {
    opts = opts || {};
    var st = { revealed: false, lines: [] };
    el.classList.add('lines');
    st.split = SplitText.create(el, {
      type: 'lines', mask: 'lines', linesClass: 'line', aria: 'none', autoSplit: true,
      onSplit: function (self) {
        st.lines = self.lines;
        gsap.set(self.lines, { yPercent: st.revealed ? 0 : 110 });
      }
    });
    st.play = function (o) {
      if (st.revealed) return;
      st.revealed = true; o = o || {};
      st.tween = gsap.to(st.lines, { yPercent: 0, duration: o.duration || 1, ease: 'expo.out', stagger: o.stagger == null ? 0.1 : o.stagger, delay: o.delay || 0, onComplete: function () { gsap.set(st.lines, { clearProps: 'willChange' }); } });
    };
    return st;
  };

  HS.prepareReveals = function (page) {
    var items = [];
    if (!HS.motion()) return items;
    $$('[data-reveal]', page).forEach(function (el) {
      var kind = el.getAttribute('data-reveal');
      var st = HS.splitLines(el);
      st.kind = kind; st.el = el;
      st.dur = kind === 'heading' ? 1.2 : 1;
      st.appear = el.hasAttribute('data-reveal-appear');
      items.push(st);
    });
    page.__reveals = items;
    return items;
  };
  // played with the page's first appearance (transition mode waits .35 + delay)
  HS.playAppearReveals = function (page) {
    (page.__reveals || []).forEach(function (st) {
      if (st.appear) st.play({ duration: st.dur, delay: 0.35 + parseFloat(st.el.getAttribute('data-delay') || 0) });
    });
  };
  HS.mountReveals = function (page, ctx) {
    var items = page.__reveals || [];
    if (!items.length) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var st = e.target.__st; io.unobserve(e.target);
        if (st) st.play({ duration: st.dur });
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    items.forEach(function (st) { st.el.__st = st; if (!st.revealed) io.observe(st.el); });
    page.__cleanups.push(function () { io.disconnect(); });
  };

  // generic IO reveal of masked children: yPercent 100 -> 0, 1s expo.out
  HS.maskRise = function (page, groupSel, itemSel, opts) {
    opts = opts || {};
    if (!HS.motion()) return;
    $$(groupSel, page).forEach(function (g) {
      var els = $$(itemSel, g);
      if (!els.length) return;
      gsap.set(els, { yPercent: 110 });
      var io = new IntersectionObserver(function (es) {
        if (!es[0].isIntersecting) return; io.disconnect();
        gsap.to(els, { yPercent: 0, duration: opts.duration || 1, ease: 'expo.out', stagger: opts.stagger || 0.06, delay: opts.delay || 0 });
      }, { rootMargin: '0px 0px -10% 0px' });
      io.observe(g);
      page.__cleanups.push(function () { io.disconnect(); });
    });
  };

  // ---- image parallax (B9wK803K.js:20): force 4, off at <=1024px ----
  HS.parallax = function (page, mm) {
    mm.add('(min-width: 1025px) and (prefers-reduced-motion: no-preference)', function () {
      var wrapped = [];
      $$('[data-parallax]', page).forEach(function (w) {
        var img = w.querySelector(':scope > img');
        if (!img) return;
        var plx = document.createElement('span'); plx.className = 'plx';
        w.insertBefore(plx, img); plx.appendChild(img);
        wrapped.push([w, plx, img]);
        var v = function () { return (w.offsetHeight / 4) * (Math.min(window.innerWidth, 1440) / 1440); };
        gsap.fromTo(plx, { y: function () { return -v() / 2; } }, { y: function () { return v() / 2; }, ease: 'none', scrollTrigger: { trigger: w, start: 'clamp(top bottom)', scrub: true, invalidateOnRefresh: true } });
      });
      return function () { wrapped.forEach(function (a) { a[0].insertBefore(a[2], a[1]); a[1].remove(); }); };
    });
  };

  // ---- footer (DuIN7YAu.js:196-215): reveal scrub on non-touch, header exit ----
  HS.mountFooter = function (page, mm) {
    var footer = $('[data-footer]', page); if (!footer) return;
    var inner = $('[data-footer-inner]', footer), shade = $('[data-footer-shade]', footer);
    mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', function () {
      var tl = gsap.timeline();
      tl.fromTo(inner, { yPercent: -20 }, { yPercent: 0, duration: 1 }, 0).fromTo(shade, { opacity: 0.8 }, { opacity: 0, duration: 0.7 }, 0);
      ScrollTrigger.create({ trigger: footer, start: 'top bottom', end: 'top top', scrub: true, animation: tl });
    });
    var header = $('[data-header]');
    ScrollTrigger.create({
      trigger: footer, start: function () { return 'top top+=' + header.offsetHeight; },
      onEnter: function () { if (HS.motion()) gsap.to(header, { yPercent: -100, duration: 0.6, ease: 'expo.out', overwrite: 'auto' }); else gsap.set(header, { yPercent: -100 }); },
      onLeaveBack: function () { gsap.to(header, { yPercent: 0, duration: HS.motion() ? 0.6 : 0, ease: 'expo.out', overwrite: 'auto' }); }
    });
  };

  // ---- page lifecycle shared by all pages ----
  HS.preparePage = function (page) {
    page.__cleanups = [];
    page.__ctx = gsap.context(function () {}, page);
    page.__ctx.add(function () {
      HS.images(page);
      HS.prepareReveals(page);
      var p = HS.pages[page.getAttribute('data-page')];
      if (p && p.prepare) p.prepare(page);
    });
  };
  HS.appearPage = function (page) {
    page.__ctx.add(function () {
      HS.playAppearReveals(page);
      var p = HS.pages[page.getAttribute('data-page')];
      if (p && p.appear) p.appear(page);
    });
  };
  HS.mountPage = function (page) {
    page.__mm = gsap.matchMedia();
    page.__ctx.add(function () {
      HS.mountReveals(page);
      HS.parallax(page, page.__mm);
      HS.mountFooter(page, page.__mm);
      if (HS.chrome) HS.chrome.bindPage(page, page.__mm);
      var p = HS.pages[page.getAttribute('data-page')];
      if (p && p.mount) p.mount(page, page.__mm);
    });
    ScrollTrigger.refresh();
    page.__mounted = true;
  };
  HS.unmountPage = function (page) {
    if (!page) return;
    (page.__cleanups || []).forEach(function (f) { try { f(); } catch (e) {} });
    if (page.__mm) page.__mm.revert();
    if (page.__ctx) page.__ctx.revert();
    var p = HS.pages[page.getAttribute('data-page')];
    if (p && p.unmount) p.unmount(page);
    page.__mounted = false;
  };
})();
