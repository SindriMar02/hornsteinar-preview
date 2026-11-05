/* work archive: filters pill (c6B0YLFU.js:59-260), filter + grid/list transitions (C9iv8-MQ.js:421-724).
   One filter at a time, URL updated with replaceState, clicking the selected option clears it. */
(function () {
  'use strict';
  var HS = window.HS; if (!HS || !HS.$) return;
  var $ = HS.$, $$ = HS.$$;
  var SECT = {}, LABELS = { won: 'Competition record', '1st': '1st prize', '2nd': '2nd place', mention: 'Special mention' };

  var S = null; // page state (rebuilt on mount)

  function parseUrl() {
    var q = new URLSearchParams(location.search);
    if (q.get('sector')) return { k: 'sector', v: q.get('sector') };
    if (q.get('competition')) return { k: 'competition', v: q.get('competition') };
    return null;
  }
  function matches(el, f) {
    if (!f) return true;
    var list = (f.k === 'sector' ? el.getAttribute('data-sectors') : el.getAttribute('data-comp')) || '';
    return list.split(' ').indexOf(f.v) > -1;
  }
  function label(f) {
    if (!f) return '';
    if (f.k === 'competition') return 'Competition: ' + (LABELS[f.v] || f.v);
    var o = $('[data-filter="sector:' + f.v + '"] .fopt-label span span');
    return 'Sector (proposed): ' + (o ? o.textContent : f.v);
  }
  // pure DOM state: which cards/rows are visible, big-card cycle, option ticks, status line, URL
  function applyState(page, f, view) {
    var cards = $$('[data-pcard]', page), rows = $$('[data-lrow]', page);
    var vis = cards.filter(function (c) { return matches(c, f); });
    cards.forEach(function (c) { c.hidden = vis.indexOf(c) < 0 || view !== 'grid'; });
    vis.forEach(function (c, i) { var idx = i % 14; c.classList.toggle('pcard-big', idx === 0 || idx === 9); });
    rows.forEach(function (r) { r.hidden = !matches(r, f); });
    $('[data-pgrid]', page).hidden = view !== 'grid';
    $('[data-lrows]', page).hidden = view !== 'list';
    $('[data-work-empty]', page).hidden = vis.length > 0;
    $('[data-work-status]', page).textContent = vis.length + ' project' + (vis.length === 1 ? '' : 's') + (f ? ' · ' + label(f) : '');
    $$('[data-filter]', page).forEach(function (b) { b.setAttribute('aria-checked', String(!!f && b.getAttribute('data-filter') === f.k + ':' + f.v)); });
    var cnt = $('[data-filters-count]', page); cnt.hidden = !f; cnt.textContent = f ? '1' : '';
    return vis;
  }
  function pushUrl(f) {
    var u = location.pathname + (f ? '?' + f.k + '=' + f.v : '');
    history.replaceState(history.state, '', u + location.hash);
  }
  function visibleEls(page, view) {
    return view === 'grid' ? $$('[data-pcard]', page).filter(function (c) { return !c.hidden; }) : $$('[data-lrow]', page).filter(function (r) { return !r.hidden; });
  }
  function enter(page, view, delay) {
    var els = visibleEls(page, view);
    if (!HS.motion() || !els.length) return;
    if (view === 'grid') {
      gsap.fromTo(els, { y: HS.rem(25), autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: 'expo.out', delay: delay == null ? 0.1 : delay, stagger: function (i) { return Math.min(i, 9) * 0.07; }, onComplete: function () { gsap.set(els, { clearProps: 'transform,opacity,visibility' }); ScrollTrigger.refresh(); } });
    } else {
      var spans = els.reduce(function (a, r) { return a.concat($$('.mask > span', r)); }, []);
      gsap.set(els, { autoAlpha: 1 });
      gsap.fromTo(spans, { yPercent: 125 }, { yPercent: 0, duration: 1, ease: 'expo.out', delay: delay == null ? 0.06 : delay, stagger: 0.025 });
      ScrollTrigger.refresh();
    }
  }

  function prepare(page) {
    var f = parseUrl();
    S = { f: f, view: 'grid' };
    applyState(page, f, 'grid');
    if (!HS.motion()) return;
    var vis = visibleEls(page, 'grid');
    gsap.set(vis.slice(0, 3), { y: HS.rem(-30) });                       // first three cards ride in with the page (C9iv8-MQ.js:724)
    gsap.set(vis.slice(3), { autoAlpha: 0 });
  }
  function appear(page) {
    if (!HS.motion()) return;
    var vis = visibleEls(page, 'grid');
    gsap.to(vis.slice(0, 3), { y: 0, duration: 2, ease: 'gl.fastInOut', stagger: 0.1 });
  }

  function mount(page, mm) {
    if (!S) S = { f: parseUrl(), view: 'grid' };
    var st = S;
    var grid = $('[data-pgrid]', page), box = $('[data-filters-box]', page), toggle = $('[data-filters-toggle]', page), panel = $('[data-filters-panel]', page);
    var opts = $$('[data-filter]', page), viewBtns = $$('[data-view]', page);
    var desc = $('[data-work-desc]', page);
    var open = false;
    var motion = HS.motion();

    // rest of the first screen: batch reveal for cards that start hidden
    if (motion) {
      var rest = visibleEls(page, 'grid').slice(3);
      ScrollTrigger.batch(rest, { start: 'top 92%', once: true, onEnter: function (b) { gsap.fromTo(b, { y: HS.rem(25), autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: 'expo.out', stagger: 0.07, onComplete: function () { gsap.set(b, { clearProps: 'transform,opacity,visibility' }); } }); } });
    }

    // ---- filter apply ----
    var busy = null;
    function setFilter(f) {
      var same = (!f && !st.f) || (f && st.f && f.k === st.f.k && f.v === st.f.v);
      if (same) return;
      st.f = f; pushUrl(f);
      var outs = visibleEls(page, st.view);
      var swap = function () { applyState(page, st.f, st.view); if (st.view === 'grid') { gsap.set(visibleEls(page, 'grid'), { autoAlpha: 0 }); } enter(page, st.view); };
      if (!motion) { applyState(page, st.f, st.view); ScrollTrigger.refresh(); return; }
      if (busy) busy.kill();
      if (window.scrollY > 4) HS.scrollTo(0);                              // scroll to zero, fade current cards .2s power2.out
      busy = gsap.to(outs, { autoAlpha: 0, duration: 0.2, ease: 'power2.out', onComplete: function () { gsap.set(outs, { clearProps: 'opacity,visibility' }); swap(); } });
    }
    opts.forEach(function (b) {
      b.addEventListener('click', function () {
        var p = b.getAttribute('data-filter').split(':'); var f = { k: p[0], v: p[1] };
        var same = st.f && st.f.k === f.k && st.f.v === f.v;
        setFilter(same ? null : f);
      });
    });

    // ---- view switch ----
    function setView(v) {
      if (v === st.view) return;
      if (v === 'list' && !HS.mq.xl.matches) return;
      var outs = visibleEls(page, st.view);
      st.view = v;
      viewBtns.forEach(function (b) { var on = b.getAttribute('data-view') === v; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
      var swap = function () { applyState(page, st.f, st.view); if (v === 'grid') gsap.set(visibleEls(page, 'grid'), { autoAlpha: 0 }); enter(page, v, 0); };
      if (!motion) { applyState(page, st.f, st.view); ScrollTrigger.refresh(); return; }
      gsap.to(outs, { autoAlpha: 0, yPercent: v === 'list' ? -3 : -15, duration: 0.3, ease: 'power2.out', stagger: { each: 0.01, from: 'end' }, onComplete: function () { gsap.set(outs, { clearProps: 'opacity,visibility,transform' }); swap(); } });
    }
    viewBtns.forEach(function (b) { b.addEventListener('click', function () { setView(b.getAttribute('data-view')); }); });
    var onXl = function () { if (!HS.mq.xl.matches && st.view === 'list') setView('grid'); };
    HS.mq.xl.addEventListener('change', onXl);

    // ---- list hover: image layers enter from -105 / 85 with gl.quicky, offsets .15 + i*.06 (C9iv8-MQ.js:75-111) ----
    $$('[data-lrow]', page).forEach(function (r) {
      var a = $('.lrow-img-a', r), b = $('.lrow-img-b', r);
      gsap.set(a, { yPercent: -110 }); gsap.set(b, { yPercent: 110 });
      var inn = function () { gsap.to([a, b], { yPercent: 0, duration: 0.8, ease: 'gl.quicky', delay: function (i) { return 0.15 + i * 0.06; }, overwrite: true }); };
      var out = function () { gsap.to(a, { yPercent: -110, duration: 0.6, ease: 'gl.quicky', overwrite: true }); gsap.to(b, { yPercent: 110, duration: 0.6, ease: 'gl.quicky', overwrite: true }); };
      r.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') inn(); });
      r.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') out(); });
      r.addEventListener('focusin', inn); r.addEventListener('focusout', out);
    });

    // ---- filters pill (c6B0YLFU.js) ----
    function openF(viaKey) {
      if (open) return; open = true;
      toggle.setAttribute('aria-expanded', 'true'); panel.hidden = false;
      var labels = $$('.fopt-label .mask > span', panel), dots = $$('.fopt-dot', panel);
      if (motion) {
        gsap.killTweensOf(box);
        gsap.fromTo(box, { width: box.offsetWidth, height: box.offsetHeight }, { width: HS.rem(23.4), height: 'auto', duration: 0.8, ease: 'expo.out' });
        gsap.fromTo(labels, { yPercent: 100 }, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.06, delay: 0.08, overwrite: true });
        gsap.fromTo(dots, { scale: 0 }, { scale: 1, duration: 0.8, ease: 'expo.out', stagger: 0.06, delay: 0.08, overwrite: true });
      } else { gsap.set(box, { width: HS.rem(23.4), height: 'auto' }); }
      (viaKey ? $('[data-filter]', panel) : panel).focus({ preventScroll: true });
    }
    function closeF(viaKey) {
      if (!open) return; open = false;
      toggle.setAttribute('aria-expanded', 'false');
      var done = function () { panel.hidden = true; gsap.set(box, { clearProps: 'width,height' }); };
      if (motion) { gsap.killTweensOf(box); gsap.to(box, { width: HS.rem(12), height: toggle.offsetHeight, duration: 0.5, ease: 'expo.out', onComplete: done }); } else done();
      if (viaKey) toggle.focus({ preventScroll: true });
    }
    toggle.addEventListener('click', function (e) { open ? closeF(e.detail === 0) : openF(e.detail === 0); });
    var onDown = function (e) { if (open && !box.contains(e.target)) closeF(false); };
    var onKey = function (e) { if (e.key === 'Escape' && open) closeF(true); };
    document.addEventListener('pointerdown', onDown); document.addEventListener('keydown', onKey);
    page.__cleanups.push(function () { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); HS.mq.xl.removeEventListener('change', onXl); });
  }

  HS.pages.work = { prepare: prepare, appear: appear, mount: mount };
})();
