/* home: hero slider (Module 8), about exit + featured-project transformation (Module 9),
   work-area spotlight (Module 11), principles rotation (Module 12), competition rows (Module 13).
   Literal values from TEARDOWN.md; sources: BEzBqhAX.js:52-900, DlrsJN3k.js:540-830. */
(function () {
  'use strict';
  var HS = window.HS; if (!HS || !HS.$) return;
  var $ = HS.$, $$ = HS.$$;
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

  function titleSplit(el) {
    var st = { shown: false, lines: [] };
    el.classList.add('lines');
    st.split = SplitText.create(el, {
      type: 'lines', mask: 'lines', linesClass: 'line', aria: 'none', autoSplit: true,
      onSplit: function (self) { st.lines = self.lines; gsap.set(self.lines, { yPercent: st.shown ? 0 : 110 }); }
    });
    return st;
  }

  // ------------------------------------------------------------------ hero
  function heroPrepare(page) {
    var root = $('[data-hero]', page); if (!root || !HS.motion()) return;
    var h = (page.__hero = { splits: $$('[data-title]', root).map(titleSplit) });
    gsap.set($$('[data-thumb]', root), { yPercent: 200 });
    gsap.set($$('.title-el', root), { yPercent: -100 });
    gsap.set($$('[data-hero-link]', root).slice(0, 1), { autoAlpha: 0 });
    gsap.set($('.hero-slide.is-active [data-inner]', root), { yPercent: 20, scale: 1.1 });
  }
  function heroAppear(page) {
    var root = $('[data-hero]', page), h = page.__hero; if (!root || !h) return;
    var md = HS.mq.md.matches, l1025 = HS.mq.l1025.matches;
    var tl = gsap.timeline();
    tl.to($('.hero-slide.is-active [data-inner]', root), { yPercent: 0, scale: 1, duration: 2, ease: 'gl.fastInOut' }, 0)
      .to($$('[data-thumb]', root), { yPercent: 0, duration: 2, ease: 'gl.fastInOut', stagger: md ? 0.03 : 0.02 }, 0.3)
      .to($$('.title-el', root), { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.05 }, 0.5)
      .add(function () { h.splits[0].shown = true; }, 0.7)
      .to(h.splits[0].lines, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: l1025 ? 0.07 : 0.04 }, 0.7)
      .to($$('[data-hero-link]', root).slice(0, 1), { autoAlpha: 1, duration: 0.4, ease: 'power2.out' }, 0.7);
  }

  function heroMount(page, mm) {
    var root = $('[data-hero]', page); if (!root) return;
    var slides = $$('.hero-slide', root), thumbs = $$('[data-thumb]', root), links = $$('[data-hero-link]', root), prog = $('[data-progress]', root), pauseBtn = $('[data-hero-pause]', root);
    var titles = $$('[data-title]', root);
    var motion = HS.motion();
    var h = page.__hero;
    var splits = h ? h.splits : null;
    if (splits) splits.forEach(function (s, i) { s.shown = i === 0; gsap.set(s.lines, { yPercent: i === 0 ? 0 : 110 }); });
    var n = slides.length, cur = 0, locked = false, paused = false, visible = true, timer = null;

    function killTimer() { if (timer) { timer.kill(); timer = null; } }
    function startTimer() {
      killTimer(); if (!motion) return;
      gsap.set(prog, { xPercent: -100 });
      timer = gsap.to(prog, { xPercent: 0, duration: 10, ease: 'none', onComplete: function () { go((cur + 1) % n, 1); } });
      if (paused || !visible || document.hidden) timer.pause();
    }
    function sync() { if (!timer) return; (paused || !visible || document.hidden || locked) ? timer.pause() : timer.resume(); }
    function mark(i) {
      thumbs.forEach(function (t, k) { if (k === i) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current'); });
      titles.forEach(function (t, k) { if (k === i) t.removeAttribute('aria-hidden'); else t.setAttribute('aria-hidden', 'true'); });
      links.forEach(function (l, k) { if (k === i) { l.removeAttribute('aria-hidden'); l.removeAttribute('tabindex'); } else { l.setAttribute('aria-hidden', 'true'); l.setAttribute('tabindex', '-1'); } });
    }
    function go(i, dir) {
      if (locked || i === cur) return;
      var from = cur;
      dir = dir || (i === (from + 1) % n ? 1 : i === (from - 1 + n) % n ? -1 : 1);
      var out = slides[from], inn = slides[i];
      mark(i); cur = i;
      if (!motion) {
        out.classList.remove('is-active'); inn.classList.add('is-active');
        gsap.set(links[from], { autoAlpha: 0 }); gsap.set(links[i], { autoAlpha: 1 });
        titles.forEach(function (t, k) { t.style.display = k === i ? '' : 'none'; });
        return;
      }
      locked = true; killTimer();
      var oP = $('[data-panel]', out), oI = $('[data-inner]', out), oS = $('[data-shade]', out), iP = $('[data-panel]', inn), iI = $('[data-inner]', inn);
      var oL = splits[from].lines, iL = splits[i].lines;
      splits[from].shown = false; splits[i].shown = true;
      inn.classList.add('is-in');
      gsap.set(iP, { yPercent: 100 * dir }); gsap.set(iI, { yPercent: -60 * dir, scale: 1 }); gsap.set(oS, { opacity: 0 });
      gsap.set(iL, { yPercent: 110 });
      var l1025 = HS.mq.l1025.matches;
      var tl = gsap.timeline({
        defaults: { duration: 1.7, ease: 'gl.fastInOut' },
        onComplete: function () {
          out.classList.remove('is-active'); inn.classList.remove('is-in'); inn.classList.add('is-active');
          gsap.set([oP, oI, oS, iP, iI], { clearProps: 'all' });
        }
      });
      tl.to(iP, { yPercent: 0 }, 0)
        .to(iI, { yPercent: 0 }, 0)
        .to(oI, { yPercent: -20 * dir, scale: 1.035 }, 0)
        .to(oS, { opacity: 0.8, duration: 0.45, ease: 'power2.out' }, '<20%')
        .to(prog, { xPercent: 100, duration: 0.8 }, 0)
        .to(oL, { yPercent: -110, duration: 1.05, ease: 'gl.quicky', stagger: 0.02 }, 0.1)
        .to(iL, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: l1025 ? 0.07 : 0.04 }, '<45%')
        .add(startTimer, '<+=0.5')
        .add(function () { locked = false; sync(); }, 0.85);
      gsap.to(links[from], { autoAlpha: 0, duration: 0.3, ease: 'power2.out' });
      gsap.to(links[i], { autoAlpha: 1, duration: 0.4, ease: 'power2.out', delay: 0.5 });
    }
    thumbs.forEach(function (t, i) { t.addEventListener('click', function () { go(i); }); });
    function onKey(e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      if (!visible || HS.chrome.menuOpen() || HS.chrome.contactOpen()) return;
      var tg = e.target; if (tg && /^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName)) return;
      go(e.key === 'ArrowRight' ? (cur + 1) % n : (cur - 1 + n) % n, e.key === 'ArrowRight' ? 1 : -1);
    }
    document.addEventListener('keydown', onKey);
    var io = new IntersectionObserver(function (es) { visible = es[0].isIntersecting; sync(); }, { threshold: 0.05 });
    io.observe(root);
    var onVis = function () { sync(); };
    document.addEventListener('visibilitychange', onVis);
    if (pauseBtn) {
      if (!motion) pauseBtn.hidden = true;
      pauseBtn.addEventListener('click', function () {
        paused = !paused; pauseBtn.setAttribute('aria-pressed', String(paused)); pauseBtn.textContent = paused ? HS.t.play : HS.t.pause; sync();
      });
    }
    page.__cleanups.push(function () { killTimer(); document.removeEventListener('keydown', onKey); document.removeEventListener('visibilitychange', onVis); io.disconnect(); });
    mark(0);
    if (motion) startTimer();

    // non-touch exit scrub: content yPercent 0 -> 25, overlay -> .3 (BEzBqhAX.js:218)
    mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', function () {
      var tl = gsap.timeline();
      tl.to($('[data-hero-content]', root), { yPercent: 25, duration: 1 }, 0).to($('[data-hero-overlay]', root), { opacity: 0.3, duration: 1 }, 0);
      ScrollTrigger.create({ trigger: root, start: 'bottom bottom', end: 'bottom top', scrub: true, animation: tl });
    });
  }

  // ------------------------------------------------------------------ about exit + featured projects
  function aboutExit(page, mm) {
    mm.add('(min-width: 1280px) and (prefers-reduced-motion: no-preference)', function () {
      var about = $('[data-block="aboutBlock"]', page), feat = $('[data-block="featuredProjectsBlock"]', page);
      if (!about || !feat) return;
      var tl = gsap.timeline();
      tl.to(about, { yPercent: 80, duration: 1 }).to(about, { autoAlpha: 0, duration: 0.6 }, 0.3).to(about, { scale: 0.98, duration: 0.35 }, '<');
      ScrollTrigger.create({
        trigger: about, endTrigger: feat, start: 'top top', end: 'top top', scrub: true, animation: tl,
        onEnter: function () { about.style.pointerEvents = 'none'; }, onLeaveBack: function () { about.style.pointerEvents = ''; }
      });
    });
  }

  function featuredDesktop(page, mm) {
    mm.add('(min-width: 1280px) and (prefers-reduced-motion: no-preference)', function () {
      var sec = $('[data-block="featuredProjectsBlock"]', page); if (!sec) return;
      var clip = $('[data-fclip]', sec), media = $('[data-fmedia0]', sec), shade = $('[data-fshade]', sec), text = $('[data-ftext]', sec);
      var cards = $$('[data-fcard]', sec), labels = $$('[data-flabel]', sec), prog = $('[data-fprogress]', sec), count = $('[data-fcount]', sec);
      var inner = $('.featured-labels-inner', sec), bar = $('.flabels-bar', sec), overlay = $('[data-foverlay]', sec);
      var c0img = $('img', cards[0]), c0media = $('[data-fmedia]', cards[0]);
      var vh = function () { return window.innerHeight; };
      var n = cards.length;
      c0img.style.transition = 'none';
      text.classList.add('lines');
      var split = SplitText.create(text, { type: 'lines,words', mask: 'lines', linesClass: 'line', aria: 'none' });
      gsap.set(split.lines, { yPercent: 110 });
      var parts = labels.map(function (l) { return [$('[data-ftitle]', l), $('[data-ftag]', l), $('[data-floc]', l)]; });
      gsap.set(labels, { visibility: 'visible' });
      parts.forEach(function (p) { gsap.set([p[0], p[2]], { autoAlpha: 0, yPercent: 0 }); gsap.set(p[1], { autoAlpha: 0 }); });
      var active = -1;
      var measure = function () {
        var f = clip.getBoundingClientRect(), v = c0media.getBoundingClientRect();
        return { sx: Math.max(0, (f.width - v.width) / 2), sy: Math.max(0, (f.height - v.height) / 2), s: Math.max(v.width / f.width, v.height / f.height) };
      };
      // 1) full image -> first card (601): clip + child scale, scrub .3, one viewport of scroll
      var morph = gsap.timeline({ defaults: { ease: 'power1.out' } });
      morph.fromTo(clip, { clipPath: 'inset(0px)' }, { clipPath: function () { var m = measure(); return 'inset(' + Math.round(m.sy) + 'px ' + Math.round(m.sx) + 'px)'; }, duration: 1 })
        .fromTo(media, { scale: 1 }, { scale: function () { return measure().s; }, duration: 1 }, '<')
        .fromTo(shade, { opacity: 1 }, { opacity: 0, duration: 0.7 }, 0.3)
        .to(split.words, { autoAlpha: 0, ease: 'power1.out', duration: 0.02, stagger: { amount: 0.2, from: 'random' } }, 0.1)
        .fromTo(c0img, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: 'none' }, 0.7);
      ScrollTrigger.create({ trigger: sec, start: 'top top', end: function () { return 'top+=' + vh() + 'px top'; }, scrub: 0.3, animation: morph, invalidateOnRefresh: true });
      // 2) entry (711): scale 1.1 -> 1, inset 2rem -> 0, shade 0 -> 1, lines 110 -> 0
      var entry = gsap.timeline();
      entry.fromTo(media, { scale: 1.1 }, { scale: 1, duration: 1 })
        .fromTo(clip, { clipPath: function () { return 'inset(' + HS.rem(2) + 'px)'; } }, { clipPath: 'inset(0px)', duration: 1 }, 0)
        .fromTo(shade, { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0)
        .to(split.lines, { yPercent: 0, stagger: { amount: 0.2 }, duration: 0.5, ease: 'power2.out' }, 0.5);
      ScrollTrigger.create({ trigger: sec, start: 'top 90%', end: 'top 10%', scrub: 0.3, animation: entry, invalidateOnRefresh: true });
      var par = gsap.timeline();
      par.fromTo(media, { yPercent: -10 }, { yPercent: 0 }).fromTo(text, { yPercent: -200 }, { yPercent: 0 }, 0);
      ScrollTrigger.create({ trigger: sec, start: 'top bottom', end: 'top top', scrub: true, animation: par });
      // 3) progress line (694) and exit (836)
      ScrollTrigger.create({ trigger: sec, start: function () { return 'top+=' + vh() + 'px top'; }, end: 'bottom bottom', scrub: 0.3, animation: gsap.fromTo(prog, { scaleX: 0 }, { scaleX: 1 }) });
      var exit = gsap.timeline();
      exit.to(inner, { y: function () { return vh() * 0.5; }, duration: 1 }, 0).to(overlay, { autoAlpha: 1, duration: 0.45 }, 0.15).to(bar, { yPercent: 300, duration: 0.4 }, 0.3);
      ScrollTrigger.create({ trigger: sec, start: 'bottom 85%', end: 'bottom top', scrub: true, animation: exit, invalidateOnRefresh: true });
      // 4) last image parallax (738)
      var last = $('.fcard-media-last', sec), limg = last && $('[data-fimg]', last);
      if (last) {
        var B = function () { return (vh() / 4) * (Math.min(window.innerWidth, 1440) / 1440); };
        var setL = function () { var t = B(); gsap.set(limg, { height: 'calc(100% + ' + t + 'px)', marginTop: '-' + t / 2 + 'px' }); };
        setL();
        ScrollTrigger.create({ trigger: last, start: 'bottom bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true, onRefresh: setL, animation: gsap.to(limg, { y: function () { return B() / 2; }, ease: 'none', paused: true }) });
      }
      // 5) label swapping (759): one idempotent state, so a jump scroll cannot leave two labels on screen
      var swapTl = null;
      function setActive(b) {
        var a = active; if (a === b) return; active = b;
        if (swapTl) swapTl.kill();
        parts.forEach(function (p, i) { if (i !== a && i !== b) { gsap.killTweensOf(p); gsap.set(p, { autoAlpha: 0 }); } });
        swapTl = gsap.timeline();
        if (a >= 0) {
          var A = parts[a];
          swapTl.to([A[0], A[2]], { autoAlpha: 0, duration: 0.15, ease: 'power2.out' }, 0.1)
            .to([A[0], A[2]], { yPercent: -30, duration: 0.6, ease: 'gl.quicky' }, 0)
            .to(A[1], { autoAlpha: 0, duration: 0.25, ease: 'power2.out' }, 0);
        }
        if (b >= 0) {
          var B = parts[b];
          swapTl.fromTo([B[0], B[2]], { yPercent: 110, autoAlpha: 1 }, { yPercent: 0, ease: 'expo.out', duration: 1 }, 0.1)
            .fromTo(B[1], { autoAlpha: 1, scale: 0, yPercent: 150 }, { scale: 1, yPercent: 0, duration: 1.2, ease: 'expo.out' }, 0.1);
        }
        count.textContent = pad(Math.max(b, 0) + 1) + ' / ' + pad(n);
      }
      // Which label is current is a pure function of the scroll position (reference: first label at section top + .6vh, each next at the card's `top center`).
      var secTop = 0, tops = [];
      function measureLabels() { var y = window.scrollY; secTop = sec.getBoundingClientRect().top + y; tops = cards.map(function (c) { return c.getBoundingClientRect().top + y; }); }
      function pick() {
        var y = window.scrollY, idx = y >= secTop + vh() * 0.6 ? 0 : -1;
        if (idx === 0) for (var i = 1; i < n; i++) if (tops[i] - vh() / 2 <= y) idx = i;
        setActive(idx);
      }
      var onRef = function () { measureLabels(); pick(); };
      ScrollTrigger.addEventListener('refresh', onRef);
      measureLabels();
      ScrollTrigger.create({ trigger: sec, start: 'top bottom', end: 'bottom top', onUpdate: pick });
      pick();
      return function () { ScrollTrigger.removeEventListener('refresh', onRef); c0img.style.transition = ''; c0img.style.opacity = ''; };
    });
  }
  function featuredAlt(page, mm) {
    mm.add('(max-width: 1279.98px) and (prefers-reduced-motion: no-preference)', function () {
      $$('[data-fcard]', page).forEach(function (c) {
        gsap.from(c, { y: HS.rem(10), autoAlpha: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: c, start: 'top 90%', once: true } });
      });
    });
  }

  // ------------------------------------------------------------------ spotlight (DlrsJN3k.js:540)
  function spot(page) {
    var sec = $('[data-spot-section]', page); if (!sec) return;
    var list = $('[data-spot-list]', sec), items = $$('[data-spot]', sec), medias = $$('[data-spot-media]', sec);
    var scrollIdx = 0, hoverIdx = null;
    function render() {
      var i = hoverIdx != null ? hoverIdx : scrollIdx;
      items.forEach(function (it, k) { it.classList.toggle('a', k === i); });
      medias.forEach(function (m, k) { m.classList.toggle('a', k === i); });
      list.classList.add('a');
    }
    render();
    items.forEach(function (it, i) {
      ScrollTrigger.create({
        trigger: it, start: function () { return window.innerWidth >= 768 ? 'top center' : 'top 90%'; },
        onEnter: function () { scrollIdx = i; render(); },
        onLeaveBack: function () { scrollIdx = i > 0 ? i - 1 : 0; render(); }
      });
      it.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { hoverIdx = i; render(); } });
      it.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { hoverIdx = null; render(); } });
      it.addEventListener('focusin', function () { hoverIdx = i; render(); });
      it.addEventListener('focusout', function () { hoverIdx = null; render(); });
    });
    HS.maskRise(page, '.spot-list', '.spot-label', { stagger: 0.06 });
  }

  // ------------------------------------------------------------------ principles (DlrsJN3k.js:749)
  function prin(page) {
    var root = $('[data-prin]', page); if (!root) return;
    var quotes = $$('[data-pq]', root), authors = $$('[data-pa]', root), idxEl = $('[data-pi-cur]', root), prog = $('[data-pprog]', root);
    var n = quotes.length, cur = 0, locked = false, paused = false, vis = false, timer = null;
    function setInert() { quotes.forEach(function (q, i) { q.setAttribute('aria-hidden', i === cur ? 'false' : 'true'); }); authors.forEach(function (a, i) { a.setAttribute('aria-hidden', i === cur ? 'false' : 'true'); }); }
    setInert();
    var prev = $('[data-pprev]', root), next = $('[data-pnext]', root), pbtn = $('[data-ppause]', root);
    if (!HS.motion()) {
      quotes.forEach(function (q, i) { q.hidden = i !== 0; }); authors.forEach(function (a, i) { a.hidden = i !== 0; });
      var show = function (d) { cur = (cur + d + n) % n; quotes.forEach(function (q, i) { q.hidden = i !== cur; }); authors.forEach(function (a, i) { a.hidden = i !== cur; }); idxEl.textContent = pad(cur + 1); setInert(); };
      prev.addEventListener('click', function () { show(-1); }); next.addEventListener('click', function () { show(1); });
      $('.prin-progress', root).hidden = true; pbtn.hidden = true;
      return;
    }
    var qs = quotes.map(function (q) { return HS.splitLines($('[data-pq-text]', q)); });
    var as = authors.map(function (a) { return HS.splitLines(a); });
    var idxSplit = null;
    function splitIdx() { idxSplit = SplitText.create(idxEl, { type: 'chars', mask: 'chars', charsClass: 'char', aria: 'none' }); }
    splitIdx(); gsap.set(idxSplit.chars, { yPercent: 100, autoAlpha: 0 });
    gsap.set(prog, { xPercent: -100 });
    function killTimer() { if (timer) { timer.kill(); timer = null; } }
    function startTimer() {
      killTimer();
      gsap.set(prog, { xPercent: -100 });
      timer = gsap.to(prog, { xPercent: 0, duration: 10, ease: 'none', onComplete: function () { change((cur + 1) % n, 1); } });
      sync();
    }
    function sync() { if (!timer) return; (paused || !vis || document.hidden || locked) ? timer.pause() : timer.resume(); }
    var started = false;
    var io = new IntersectionObserver(function (es) {
      vis = es[0].isIntersecting;
      if (vis && !started) {
        started = true;
        var l1025 = HS.mq.l1025.matches;
        qs[0].play({ duration: 1.2, stagger: l1025 ? 0.07 : 0.04 }); as[0].play({ duration: 1.2, delay: 0.1 });
        gsap.to(idxSplit.chars, { yPercent: 0, autoAlpha: 1, duration: 1.2, ease: 'expo.out', stagger: 0.04 });
        startTimer();
      }
      sync();
    }, { threshold: 0.25 });
    io.observe(root);
    var onVis = function () { sync(); }; document.addEventListener('visibilitychange', onVis);
    pbtn.addEventListener('click', function () { paused = !paused; pbtn.setAttribute('aria-pressed', String(paused)); pbtn.textContent = paused ? HS.t.play : HS.t.pause; sync(); });
    function change(i, dir) {
      if (locked || i === cur || !started) return;
      locked = true; killTimer();
      var from = cur; cur = i; setInert();
      var oq = qs[from], iq = qs[i], oa = as[from], ia = as[i];
      var l1025 = HS.mq.l1025.matches;
      oq.revealed = false; iq.revealed = true; oa.revealed = false; ia.revealed = true;
      gsap.set(iq.lines, { yPercent: 110 }); gsap.set(ia.lines, { yPercent: 110 });
      var tl = gsap.timeline({ defaults: { duration: 1.2, ease: 'expo.out' } });
      tl.to(prog, { xPercent: 100, duration: 0.8, ease: 'gl.fastInOut' }, 0)
        .to(idxSplit.chars, { yPercent: -50, scale: 0.5, duration: 0.8, ease: 'gl.quicky' }, 0.2)
        .to(idxSplit.chars, { autoAlpha: 0, duration: 0.35, ease: 'power2.out' }, 0.2)
        .add(function () {
          idxSplit.revert(); idxEl.textContent = pad(i + 1); splitIdx();
          gsap.set(idxSplit.chars, { yPercent: 70, scale: 0.5, autoAlpha: 0 });
          gsap.to(idxSplit.chars, { yPercent: 0, scale: 1, duration: 1.2, ease: 'expo.out', stagger: 0.04 });
          gsap.to(idxSplit.chars, { autoAlpha: 1, duration: 0.15, ease: 'power2.out', stagger: 0.04 });
        }, 0.55)
        .to(oq.lines, { yPercent: -110, duration: 1.05, ease: 'gl.quicky', stagger: 0.02 }, 0)
        .to(iq.lines, { yPercent: 0, stagger: l1025 ? 0.07 : 0.04 }, '<40%')
        .to(oa.lines, { yPercent: -110, duration: 1.05, ease: 'gl.quicky', stagger: 0.02 }, 0.1)
        .to(ia.lines, { yPercent: 0 }, '<40%')
        .add(startTimer, '<+=0.5')
        .add(function () { locked = false; sync(); }, 0.85);
    }
    prev.addEventListener('click', function () { change((cur - 1 + n) % n, -1); });
    next.addEventListener('click', function () { change((cur + 1) % n, 1); });
    page.__cleanups.push(function () { killTimer(); io.disconnect(); document.removeEventListener('visibilitychange', onVis); });
  }

  // ------------------------------------------------------------------ competition rows
  function comps(page) {
    var rows = $$('.awards .arow', page); if (!rows.length || !HS.motion()) return;
    gsap.set(rows, { autoAlpha: 0 });
    ScrollTrigger.batch(rows, { start: 'top 92%', once: true, onEnter: function (b) { gsap.fromTo(b, { y: HS.rem(8), autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, ease: 'expo.out', stagger: 0.07 }); } });
  }

  HS.pages.home = {
    prepare: heroPrepare,
    appear: heroAppear,
    mount: function (page, mm) {
      heroMount(page, mm); aboutExit(page, mm); featuredDesktop(page, mm); featuredAlt(page, mm);
      spot(page); prin(page); comps(page);
    }
  };
})();
