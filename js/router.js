/* router: cold-load wipe (Module 5, DmkCsKWL.js:28793) and the default page transition (DmkCsKWL.js:16721):
   new page enters fixed from y -innerHeight to 0 over 2s gl.fastInOut while the old page drops 20rem and darkens (--ov 0 -> .9, .7s alpha, at .1).
   Plain links stay real links: anything unusual (modifier keys, other origin, fetch failure) falls back to normal navigation. */
(function () {
  'use strict';
  var HS = window.HS; if (!HS || !HS.$ || !window.gsap || !HS.chrome) return;
  var $ = HS.$;
  var html = document.documentElement;
  var busy = false, queued = null;
  var cur = location.pathname + location.search;
  var firstMq = HS.mq.reduce.matches;

  function pageEl() { return $('.page'); }

  function finishCold(page, wrap, loader, header) {
    gsap.set(page, { clearProps: 'all' });
    page.classList.remove('is-entering');
    html.classList.remove('is-loading');
    gsap.set([wrap, header], { clearProps: 'visibility,opacity' });
    if (loader) loader.style.display = 'none';
    HS.lock(false);
    HS.mountPage(page);
    HS.booted = true;
  }

  function coldIntro(page) {
    var wrap = $('[data-page-wrap]'), loader = $('[data-loader]'), header = $('[data-header]');
    var first = $('img[fetchpriority="high"]', page);
    var dec = first && first.decode ? first.decode().catch(function () {}) : Promise.resolve();
    Promise.race([dec, new Promise(function (r) { setTimeout(r, 1500); })]).then(function () {
      window.scrollTo(0, 0);
      var vh = window.innerHeight;
      page.classList.add('is-entering');
      gsap.set(page, { y: -vh });
      gsap.set(wrap, { visibility: 'visible' });
      HS.lock(true);
      var tl = gsap.timeline({
        delay: 0.4, defaults: { duration: 2, ease: 'gl.fastInOut' },
        onStart: function () { loader.classList.add('is-under'); },
        onComplete: function () { finishCold(page, wrap, loader, header); }
      });
      tl.to(page, { y: 0 }, 0).to(loader, { yPercent: 15 }, 0)
        .add(function () { HS.appearPage(page); gsap.to(header, { opacity: 1, duration: 0.4, ease: 'power2.out' }); }, '<5%');
    });
  }

  function swapHead(doc) {
    document.title = doc.title;
    var d = doc.querySelector('meta[name="description"]'), cd = document.querySelector('meta[name="description"]');
    if (d && cd) cd.setAttribute('content', d.getAttribute('content'));
    document.body.className = doc.body.className;
    document.body.setAttribute('data-page', doc.body.getAttribute('data-page') || '');
  }

  function navigate(url, push) {
    if (busy) { queued = [url, push]; return; }
    busy = true;
    var old = pageEl(), wrap = old.parentNode, header = $('[data-header]');
    fetch(url, { credentials: 'same-origin' }).then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.text(); }).then(function (text) {
      var doc = new DOMParser().parseFromString(text, 'text/html');
      var next = doc.querySelector('.page'); if (!next) throw new Error('no page');
      next = document.importNode(next, true);
      var menuWasOpen = HS.chrome.menuOpen();
      if (HS.chrome.contactOpen()) HS.chrome.closeContact(true);
      if (menuWasOpen) HS.chrome.closeMenu(false);
      var u = new URL(url, location.href);
      if (push) history.pushState({ p: 1 }, '', u.pathname + u.search + u.hash);
      cur = u.pathname + u.search;
      var motion = HS.motion();
      var finish = function () {
        HS.unmountPage(old); old.remove();
        gsap.set(next, { clearProps: 'all' }); next.classList.remove('is-entering');
        window.scrollTo(0, 0);
        if (HS.lenis) { HS.lenis.scrollTo(0, { immediate: true, force: true }); HS.lenis.resize(); }
        HS.lock(false);
        HS.mountPage(next);
        busy = false; flush();
      };
      swapHead(doc);
      HS.chrome.setDark(next.getAttribute('data-header-start') === 'dark');
      if (!motion) {
        wrap.appendChild(next); HS.preparePage(next);
        gsap.set(old, { clearProps: 'all' });
        HS.unmountPage(old); old.remove(); next.classList.remove('is-entering');
        window.scrollTo(0, 0); HS.appearPage(next); HS.mountPage(next); busy = false; flush(); return;
      }
      var vh = window.innerHeight;
      next.classList.add('is-entering');
      gsap.set(next, { y: -vh });
      wrap.appendChild(next);
      HS.preparePage(next);
      HS.lock(true);
      old.classList.add('is-leaving'); old.style.pointerEvents = 'none';
      if (HS.chrome.expand) HS.chrome.expand();
      gsap.to(header, { yPercent: 0, duration: 0.6, ease: 'expo.out', overwrite: 'auto' });
      var tl = gsap.timeline({ defaults: { duration: 2, ease: 'gl.fastInOut' }, onComplete: finish });
      tl.to(next, { y: 0 }, 0);
      if (!menuWasOpen) tl.to(old, { y: HS.rem(20) }, 0);
      tl.to($('[data-page-inner]', old), { '--ov': 0.9, duration: 0.7, ease: 'alpha' }, 0.1)
        .add(function () { HS.appearPage(next); }, '<5%');
    }).catch(function () { busy = false; location.href = url; });
  }
  function flush() { if (queued) { var q = queued; queued = null; var u = new URL(q[0], location.href); if (u.pathname + u.search !== cur || q[1]) navigate(q[0], q[1]); } }

  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
    if ((a.target && a.target !== '_self') || a.hasAttribute('download') || a.hasAttribute('data-lang-link')) return; // language switch = full load (header, menu and footer are outside the swapped page)
    var u; try { u = new URL(a.href, location.href); } catch (err) { return; }
    if (u.origin !== location.origin || !/\.html$|\/$/.test(u.pathname)) return;
    if (u.pathname === location.pathname && u.search === location.search) {
      if (u.hash) return;
      e.preventDefault(); if (HS.chrome.menuOpen()) HS.chrome.closeMenu(false); HS.scrollTo(0); return;
    }
    e.preventDefault();
    navigate(u.href, true);
  });

  window.addEventListener('popstate', function () {
    var p = location.pathname + location.search;
    if (p === cur) return;                       // contact sheet and filters only change the hash/query
    navigate(location.href, false);
  });

  HS.mq.reduce.addEventListener('change', function () { if (HS.mq.reduce.matches !== firstMq) location.reload(); });

  HS.boot = function () {
    try { history.scrollRestoration = 'manual'; } catch (e) {}
    HS.initScroll();
    HS.chrome.init();
    var page = pageEl();
    HS.fontsReady().then(function () {
      HS.preparePage(page);
      if (html.classList.contains('is-loading')) coldIntro(page);
      else { HS.appearPage(page); HS.mountPage(page); HS.booted = true; }
    });
  };
  HS.boot();
})();
