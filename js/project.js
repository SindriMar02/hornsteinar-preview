/* project template (Module 19: Cu5Fbrpo.js:92-117, 373-560), studio page vision (Module 16: DLVbjTb_.js:617-690), contact page. */
(function () {
  'use strict';
  var HS = window.HS; if (!HS || !HS.$) return;
  var $ = HS.$, $$ = HS.$$;

  // ------------------------------------------------------------------ project
  function projPrepare(page) {
    if (!HS.motion()) return;
    var inner = $('.phero-inner', page);
    if (inner) gsap.set(inner, { yPercent: 20, scale: 1.1 });
    gsap.set($$('[data-stat]', page), { yPercent: 100 });
    gsap.set($$('.pstat .dot', page), { scale: 0 });
  }
  function projAppear(page) {
    if (!HS.motion()) return;
    var tl = gsap.timeline();
    tl.to($('.phero-inner', page), { yPercent: 0, scale: 1, duration: 2, ease: 'gl.fastInOut' }, 0);
    var st = gsap.timeline({ delay: 0.6, defaults: { duration: 1, ease: 'expo.out' } });
    st.to($$('.pstat .label-s [data-stat]', page), { yPercent: 0, stagger: 0.05 }, 0)
      .to($$('.pstat .body-m [data-stat]', page), { yPercent: 0, stagger: 0.05 }, 0.1)
      .to($$('.pstat .dot', page), { scale: 1, duration: 0.8 }, '<10%');
  }

  function kpi(page) {
    var k = $('[data-kpi]', page); if (!k) return;
    var bar = $('[data-kpi-toggle]', k), list = $('.kpi-list', k), lEl = $('[data-kpi-l]', k), vEl = $('[data-kpi-v]', k);
    var items = $$('.kpi-list li', k).map(function (li) { return { l: li.children[0].textContent, v: li.children[1].textContent }; });
    var motion = HS.motion(), expanded = false, idx = 0, passed = false, inRelated = false, timer = null;
    k.classList.add('is-hidden');
    var vis = function () { k.classList.toggle('is-hidden', !(passed && !inRelated)); };
    ScrollTrigger.create({ trigger: $('.pintro', page), start: 'top 85%', onEnter: function () { passed = true; vis(); }, onLeaveBack: function () { passed = false; vis(); } });
    ScrollTrigger.create({ trigger: $('.related', page), start: 'top 85%', onEnter: function () { inRelated = true; vis(); }, onLeaveBack: function () { inRelated = false; vis(); } });
    function cycle() {
      if (!motion || expanded || k.classList.contains('is-hidden') || document.hidden || items.length < 2 || k.matches(':hover, :focus-within')) return;
      idx = (idx + 1) % items.length;
      var els = [lEl, vEl];
      gsap.timeline()
        .to(els, { yPercent: -100, duration: 0.8, ease: 'gl.quicky', stagger: 0.015 })
        .add(function () { lEl.textContent = items[idx].l; vEl.textContent = items[idx].v; })
        .fromTo(els, { yPercent: 100 }, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: 0.015 }, '<20%');
    }
    if (motion) timer = setInterval(cycle, 3000);
    function setOpen(on) {
      if (on === expanded) return; expanded = on;
      bar.setAttribute('aria-expanded', String(on));
      var lis = $$('li', list);
      gsap.killTweensOf([list, lis]);
      if (on) {
        list.classList.add('is-open');
        if (motion) {
          gsap.to(list, { height: 'auto', duration: 0.8, ease: 'gl.smoothInOut' });
          gsap.fromTo(lis, { yPercent: 100, scale: 0.8, autoAlpha: 1 }, { yPercent: 0, scale: 1, duration: 0.8, ease: 'gl.smoothInOut', stagger: 0.1, delay: 0.04 });
        } else gsap.set(list, { height: 'auto' });
      } else {
        var done = function () { list.classList.remove('is-open'); };
        if (motion) {
          gsap.to(lis, { yPercent: 50, scale: 0.8, autoAlpha: 0, duration: 0.5, ease: 'expo.out', stagger: -0.03 });
          gsap.to(list, { height: 0, duration: 0.7, ease: 'expo.out', onComplete: done });
        } else { gsap.set(list, { height: 0 }); done(); }
      }
    }
    bar.addEventListener('click', function () { setOpen(!expanded); });
    var onDown = function (e) { if (expanded && !k.contains(e.target)) setOpen(false); };
    var onKey = function (e) { if (e.key === 'Escape' && expanded) { setOpen(false); bar.focus({ preventScroll: true }); } };
    document.addEventListener('pointerdown', onDown); document.addEventListener('keydown', onKey);
    page.__cleanups.push(function () { clearInterval(timer); document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); });
  }

  function projMount(page, mm) {
    mm.add('(min-width: 1025px) and (prefers-reduced-motion: no-preference)', function () {
      var hero = $('[data-phero]', page), inner = $('.phero-inner', page);
      if (!hero || hero.classList.contains('phero-contained')) return;
      gsap.to(inner, { yPercent: 12, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    });
    kpi(page);
    HS.maskRise(page, '.related-list', '.rel-text .mask > *', { stagger: 0.06 });
  }

  // ------------------------------------------------------------------ studio page
  function aboutMount(page, mm) {
    var sec = $('[data-vision]', page); if (!sec) return;
    var rows = $$('.vis-row', sec), titles = $$('[data-vision-title]', sec);
    mm.add('(prefers-reduced-motion: no-preference)', function () {
      var x = HS.rem(3.2), act = {};
      titles.forEach(function (t, i) {
        var first = i === 0, last = i === titles.length - 1, target = first ? 0 : last ? 1 : 0.5;
        var tw = first ? gsap.fromTo(t, { x: x }, { x: 0, ease: 'none', paused: true })
          : last ? gsap.fromTo(t, { x: 0 }, { x: x, ease: 'none', paused: true })
          : gsap.to(t, { keyframes: [{ x: 0 }, { x: x }, { x: 0 }], ease: 'none', easeEach: 'none', paused: true });
        ScrollTrigger.create({
          trigger: t, animation: tw, scrub: 0.5,
          start: first ? 'center center' : 'top 60%', end: first ? 'bottom 40%' : last ? 'center center' : 'bottom 40%',
          onUpdate: function (self) {
            var on = Math.abs(self.progress - target) <= 0.1 && self.isActive;
            act[i] = on; rows[i].classList.toggle('is-active', on);
            sec.classList.toggle('has-active', Object.keys(act).some(function (k) { return act[k]; }));
          },
          onToggle: function (self) { if (!self.isActive) { act[i] = false; rows[i].classList.remove('is-active'); sec.classList.toggle('has-active', Object.keys(act).some(function (k) { return act[k]; })); } }
        });
      });
    });
    mm.add('(min-width: 1025px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', function () {
      var wrap = $('[data-vis-wrap]', sec), shade = $('[data-vis-shade]', sec);
      var tl = gsap.timeline();
      tl.to(wrap, { y: function () { return window.innerHeight * 0.7; }, scale: 0.97, duration: 1 }, 0).to(shade, { opacity: 1, duration: 0.5 }, 0.3);
      ScrollTrigger.create({ trigger: sec, start: 'bottom bottom', end: 'bottom bottom-=100%', scrub: true, animation: tl, invalidateOnRefresh: true });
    });
  }

  HS.pages.project = { prepare: projPrepare, appear: projAppear, mount: projMount };
  HS.pages.about = { mount: aboutMount };
  HS.pages.contact = {};
})();
