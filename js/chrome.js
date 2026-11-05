/* chrome: header (theme + desktop collapse), full-screen menu, contact sheet.
   Source: TEARDOWN.md module 7 (DmkCsKWL.js:36650-36950) and module 23 (contact modal, DmkCsKWL.js:29123). */
(function () {
  'use strict';
  var HS = window.HS; if (!HS || !HS.$) return;
  var $ = HS.$, $$ = HS.$$;
  var html = document.documentElement;
  var C = (HS.chrome = {});
  var header, menu, mPanel, mBackdrop, mToggle, contactEl, cPanel, pillContact;
  var state = { menu: false, contact: false, collapsed: false, lastOpener: null, tl: null, menuLock: false };
  var darkSet = new Set();
  var K = function () { return HS.motion() ? 1 : 0; };

  function pageEl() { return $('.page'); }
  function focusables(root) {
    return $$('a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])', root).filter(function (el) { return el.offsetParent !== null || el === document.activeElement; });
  }
  function trap(e, root, extraFirst) {
    if (e.key !== 'Tab') return;
    var list = focusables(root);
    if (extraFirst) list.unshift(extraFirst);
    if (!list.length) return;
    var first = list[0], last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  C.init = function () {
    header = $('[data-header]'); menu = $('[data-menu]'); mPanel = $('[data-menu-panel]'); mBackdrop = $('[data-menu-backdrop]');
    mToggle = $('[data-menu-toggle]'); contactEl = $('[data-contact]'); cPanel = $('[data-contact-panel]'); pillContact = $('.pill-contact');
    if (!header) return;
    HS.images(menu);
    // initial menu transforms (36864)
    gsap.set(mBackdrop, { yPercent: -100 }); gsap.set(mPanel, { yPercent: -100 });
    gsap.set($$('[data-menu-nav]'), { yPercent: -120 });
    gsap.set($$('.menu-foot .mask > *, .menu-card-text .mask > *'), { yPercent: -120 });
    gsap.set($$('.menu-card-img img'), { yPercent: 150 });

    mToggle.addEventListener('click', function (e) { state.menu ? C.closeMenu(false, e.detail === 0) : C.openMenu(e.detail === 0); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { if (state.contact) C.closeContact(false, true); else if (state.menu) C.closeMenu(false, true); }
      if (state.menu) trap(e, menu, mToggle);
      if (state.contact) trap(e, cPanel);
    });
    $$('[data-contact-open]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault(); C.openContact(e.detail === 0, a);
      });
    });
    $$('[data-contact-close]').forEach(function (b) { b.addEventListener('click', function (e) { C.closeContact(false, e.detail === 0); }); });
    window.addEventListener('popstate', function () {
      if (location.hash === '#contact' && !state.contact) C.openContact(false, null, true);
      else if (location.hash !== '#contact' && state.contact) C.closeContact(false, false, true);
    });
    if (location.hash === '#contact') setTimeout(function () { C.openContact(false, null, true); }, 50);
  };

  // ---------- header ----------
  function setDark(on) { header.classList.toggle('is-dark', !!on); }
  C.setDark = setDark;

  C.bindPage = function (page, mm) {
    if (!header) return;
    setDark(page.getAttribute('data-header-start') === 'dark');
    darkSet.clear();
    $$('[data-dark]', page).forEach(function (sec) {
      ScrollTrigger.create({
        trigger: sec,
        start: function () { return 'top-=' + HS.rem(3.5) + ' top'; },
        end: function () { return 'bottom-=' + HS.rem(3.5) + ' top'; },
        onToggle: function (self) { self.isActive ? darkSet.add(sec) : darkSet['delete'](sec); setDark(darkSet.size > 0); }
      });
    });
    // desktop scroll collapse (36907): nav hides, contact slides, menu button appears
    mm.add('(min-width: 1280px)', function () {
      var nav = $$('.header-nav li'), btn = $('.pill-menu');
      var off = function () { return HS.rem(5.6); };
      function applyState(c, animate) {
        state.collapsed = c;
        var d = animate && HS.motion();
        if (c) {
          gsap.to(nav, { yPercent: -120, duration: d ? 0.6 : 0, ease: 'expo.out', stagger: d ? 0.01 : 0, overwrite: 'auto' });
          gsap.to(pillContact, { x: 0, duration: d ? 1 : 0, ease: 'gl.quicky', overwrite: 'auto' });
          gsap.to(btn, { autoAlpha: 1, scale: 1, duration: d ? 1 : 0, ease: 'gl.quicky', overwrite: 'auto', delay: d ? 0.05 : 0 });
        } else {
          gsap.to(nav, { yPercent: 0, duration: d ? 0.8 : 0, ease: 'expo.out', stagger: d ? 0.02 : 0, overwrite: 'auto' });
          gsap.to(pillContact, { x: off(), duration: d ? 0.8 : 0, ease: 'expo.out', overwrite: 'auto' });
          gsap.to(btn, { autoAlpha: 0, scale: 0.4, duration: d ? 0.5 : 0, ease: 'expo.out', overwrite: 'auto' });
        }
      }
      gsap.set(nav, { yPercent: 0 }); gsap.set(pillContact, { x: off() }); gsap.set(btn, { autoAlpha: 0, scale: 0.4 });
      if (window.scrollY > 100) applyState(true, false);
      ScrollTrigger.create({ trigger: page, start: 'top+=100px top', onEnter: function () { applyState(true, true); }, onLeaveBack: function () { applyState(false, true); } });
      C.expand = function () { if (state.collapsed) applyState(false, true); };
      return function () { C.expand = null; state.collapsed = false; };
    });
    gsap.set(header, { yPercent: 0 });
  };

  // ---------- menu (36766 open / 36801 close) ----------
  C.menuOpen = function () { return state.menu; };
  C.openMenu = function (viaKey) {
    if (state.menu) return;
    state.menu = true; state.lastOpener = mToggle;
    menu.hidden = false;
    html.classList.add('menu-open');
    mToggle.setAttribute('aria-expanded', 'true'); mToggle.setAttribute('aria-label', 'Close menu');
    var page = pageEl(); if (page) { page.setAttribute('inert', ''); $('[data-page-inner]', page).classList.add('a'); }
    if (!state.menuLock) { state.menuLock = true; HS.lock(true); }
    if (state.tl) state.tl.kill();
    var nav = $$('[data-menu-nav]'), textBits = $$('.menu-foot .mask > *, .menu-card-text .mask > *'), imgs = $$('.menu-card-img img');
    var tl = (state.tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.2 } }));
    tl.to(mBackdrop, { yPercent: 0 }, 0.1)
      .to(pillContact, { autoAlpha: 0, duration: 0.2, ease: 'power2.out' }, 0)
      .to(mPanel, { yPercent: 0, ease: 'gl.fastInOut' }, 0)
      .to(page, { y: HS.rem(20), ease: 'gl.fastInOut' }, 0)
      .to(nav, { yPercent: 0, stagger: 0.03 }, '<30%')
      .to(textBits, { yPercent: 0, stagger: 0.05 }, '<5%')
      .to(imgs, { yPercent: 0, stagger: 0.05, duration: 1, ease: 'gl.fastInOut' }, '<20%');
    if (!K()) tl.progress(1);
    (viaKey ? focusables(menu)[0] : mPanel).focus({ preventScroll: true });
  };
  C.closeMenu = function (instant, viaKey) {
    if (!state.menu) return Promise.resolve();
    state.menu = false;
    mToggle.setAttribute('aria-expanded', 'false'); mToggle.setAttribute('aria-label', 'Open menu');
    var page = pageEl();
    if (state.tl) state.tl.kill();
    var nav = $$('[data-menu-nav]'), textBits = $$('.menu-foot .mask > *, .menu-card-text .mask > *'), imgs = $$('.menu-card-img img');
    var tl = (state.tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.2 } }));
    var done = new Promise(function (res) {
      tl.to(mPanel, { yPercent: -100, ease: 'gl.fastInOut' }, 0)
        .to(page, { y: 0, ease: 'gl.fastInOut' }, 0)
        .to(mBackdrop, { yPercent: -100, ease: 'gl.fastInOut' }, 0.05)
        .to(pillContact, { autoAlpha: 1, duration: 0.35, ease: 'power2.out' }, '<60%')
        .to([nav, textBits], { yPercent: -100, stagger: -0.01 }, 0)
        .to(imgs, { yPercent: 150, stagger: -0.01 }, 0)
        .add(function () {
          menu.hidden = true; html.classList.remove('menu-open');
          if (page) { page.removeAttribute('inert'); var pi = $('[data-page-inner]', page); if (pi) pi.classList.remove('a'); gsap.set(page, { clearProps: 'transform' }); }
          gsap.set($$('[data-menu-nav]'), { yPercent: -120 }); gsap.set($$('.menu-foot .mask > *, .menu-card-text .mask > *'), { yPercent: -120 }); gsap.set(imgs, { yPercent: 150 });
          if (state.menuLock) { state.menuLock = false; HS.lock(false); }
          if (viaKey) mToggle.focus({ preventScroll: true });
          res();
        });
      if (instant || !K()) tl.progress(1);
    });
    return done;
  };

  // ---------- contact sheet (CSS transitions; hash driven) ----------
  C.contactOpen = function () { return state.contact; };
  C.openContact = function (viaKey, opener, fromHash) {
    if (state.contact) return;
    if (state.menu) C.closeMenu(true);
    state.contact = true; state.lastOpener = opener || pillContact;
    contactEl.classList.add('is-open'); contactEl.setAttribute('aria-hidden', 'false');
    var page = pageEl(); if (page) page.setAttribute('inert', '');
    HS.lock(true);
    if (!fromHash) history.pushState({ contact: 1 }, '', '#contact');
    (viaKey ? focusables(cPanel)[0] : cPanel).focus({ preventScroll: true });
  };
  C.closeContact = function (instant, viaKey, fromHash) {
    if (!state.contact) return;
    state.contact = false;
    contactEl.classList.remove('is-open'); contactEl.setAttribute('aria-hidden', 'true');
    var page = pageEl(); if (page) page.removeAttribute('inert');
    HS.lock(false);
    if (!fromHash) { if (history.state && history.state.contact) history.back(); else if (location.hash === '#contact') history.replaceState(null, '', location.pathname + location.search); }
    if (viaKey && state.lastOpener) state.lastOpener.focus({ preventScroll: true });
  };
})();
