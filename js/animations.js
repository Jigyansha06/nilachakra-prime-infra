/* ============================================================
   ANIMATIONS.JS
   Preloader, Lenis smooth scroll, GSAP ScrollTrigger reveals,
   custom cursor, hero slider, split-text headline reveals.
   Degrades gracefully if GSAP/Lenis/SplitType fail to load
   (e.g. offline) — content remains visible and usable.
   ============================================================ */

(function(){
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof gsap !== 'undefined';
  const hasScrollTrigger = hasGSAP && typeof ScrollTrigger !== 'undefined';
  const hasLenis = typeof Lenis !== 'undefined';
  const hasSplit = typeof SplitType !== 'undefined';

  if (hasGSAP && hasScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  /* ============================================================
     PRELOADER — always resolves, hard fallback timeout included
     ============================================================ */
  const preloader = document.querySelector('.preloader');
  const preloaderBar = document.querySelector('.preloader__line i');
  const preloaderPct = document.querySelector('.preloader__pct');

  function hidePreloader(){
    if (!preloader || preloader.classList.contains('is-hidden')) return;
    preloader.classList.add('is-hidden');
    document.body.classList.remove('js-loading');
    document.documentElement.style.overflow = '';
    startPageAnimations();
  }

  (function runPreloader(){
    if (!preloader){ startPageAnimations(); return; }
    document.body.classList.add('js-loading');
    let progress = 0;
    const tick = () => {
      progress += Math.random() * 18 + 6;
      if (progress >= 100) progress = 100;
      if (preloaderBar) preloaderBar.style.width = progress + '%';
      if (preloaderPct) preloaderPct.textContent = Math.floor(progress).toString().padStart(2, '0') + '%';
      if (progress < 100) requestAnimationFrame(() => setTimeout(tick, 90));
      else setTimeout(hidePreloader, 260);
    };
    requestAnimationFrame(() => setTimeout(tick, 200));
    // Absolute fallback — never trap the user
    setTimeout(hidePreloader, 4200);
    window.addEventListener('load', () => setTimeout(hidePreloader, 400));
  })();

  /* ============================================================
     LENIS SMOOTH SCROLL
     ============================================================ */
  let lenis = null;
  if (hasLenis && !reducedMotion){
    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.2,
    });
    function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (hasScrollTrigger){
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
  }
  window.NPI_LENIS = lenis;

  /* ============================================================
     CUSTOM CURSOR
     ============================================================ */
  (function cursor(){
    const el = document.querySelector('.cursor');
    if (!el || window.matchMedia('(hover:none), (pointer:coarse)').matches) return;
    let x = window.innerWidth / 2, y = window.innerHeight / 2, cx = x, cy = y;
    window.addEventListener('mousemove', (e) => { x = e.clientX; y = e.clientY; });
    (function loop(){
      cx += (x - cx) * 0.18; cy += (y - cy) * 0.18;
      el.style.transform = `translate(${cx}px, ${cy}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('a, button, [data-cursor]').forEach(node => {
      node.addEventListener('mouseenter', () => {
        el.classList.add('is-active');
        const label = node.getAttribute('data-cursor-label');
        const labelEl = el.querySelector('.cursor__label');
        if (labelEl) labelEl.textContent = label || '';
      });
      node.addEventListener('mouseleave', () => el.classList.remove('is-active'));
    });
  })();

  /* ============================================================
     SPLIT TEXT HEADLINE REVEALS
     ============================================================ */
  function revealHeadline(el, delay){
    if (!el) return;
    if (hasSplit && hasGSAP){
      const split = new SplitType(el, { types: 'lines,words' });
      gsap.set(split.words, { yPercent: 120, opacity: 0 });
      gsap.to(split.words, {
        yPercent: 0, opacity: 1, duration: 1.1, stagger: 0.035,
        ease: 'power4.out', delay: delay || 0,
      });
    } else {
      el.style.opacity = 1;
    }
  }

  /* ============================================================
     HERO SLIDER — cinematic clip-path wipe between scenes, rather
     than a plain crossfade, so slide changes read as a scene cut.
     ============================================================ */
  function initHeroSlider(){
    const slides = document.querySelectorAll('.hero__slide');
    const dots = document.querySelectorAll('.hero__dots button');
    if (!slides.length) return;
    let active = 0;
    let timer;
    let animating = false;

    function animateMediaIn(slide){
      const media = slide.querySelector('.hero__media');
      if (!hasGSAP || !media) return;
      gsap.fromTo(media, { scale: 1.16 }, { scale: 1.02, duration: 7, ease: 'sine.out' });
    }

    function goTo(index){
      if (animating || index === active) return;
      const prevSlide = slides[active];
      const nextIndex = (index + slides.length) % slides.length;
      const nextSlide = slides[nextIndex];
      animating = true;

      dots[active] && dots[active].classList.remove('is-active');
      dots[nextIndex] && dots[nextIndex].classList.add('is-active');

      if (hasGSAP){
        nextSlide.classList.add('is-active');
        gsap.set(nextSlide, { clipPath: 'inset(0 0 0 100%)', zIndex: 2 });
        gsap.set(prevSlide, { zIndex: 1 });
        gsap.to(nextSlide, {
          clipPath: 'inset(0 0 0 0%)', duration: 1.3, ease: 'power4.inOut',
          onComplete: () => {
            prevSlide.classList.remove('is-active');
            gsap.set(nextSlide, { clearProps: 'clipPath,zIndex' });
            gsap.set(prevSlide, { clearProps: 'zIndex' });
            animating = false;
          }
        });
        animateMediaIn(nextSlide);
      } else {
        prevSlide.classList.remove('is-active');
        nextSlide.classList.add('is-active');
        animating = false;
      }

      active = nextIndex;
      revealHeadline(nextSlide.querySelector('.hero__headline'), hasGSAP ? 0.55 : 0.1);
      restart();
    }

    function restart(){
      clearTimeout(timer);
      timer = setTimeout(() => goTo(active + 1), 6500);
    }

    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
    revealHeadline(slides[0].querySelector('.hero__headline'), 0.4);
    animateMediaIn(slides[0]);
    restart();
  }

  /* ============================================================
     SCROLL REVEALS (data-reveal / data-reveal-fade)
     ============================================================ */
  function initReveals(){
    if (!hasGSAP){
      document.querySelectorAll('[data-reveal], [data-reveal-fade]').forEach(el => {
        el.style.opacity = 1; el.style.transform = 'none';
      });
      return;
    }
    const items = document.querySelectorAll('[data-reveal]');
    items.forEach((el) => {
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: {
          trigger: el, start: 'top 88%', once: true,
        }
      });
    });
    document.querySelectorAll('[data-reveal-fade]').forEach((el) => {
      gsap.to(el, {
        opacity: 1, duration: 1.2, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });

    // Staggered groups
    document.querySelectorAll('[data-reveal-group]').forEach((group) => {
      const kids = group.children;
      gsap.set(kids, { opacity: 0, y: 30 });
      gsap.to(kids, {
        opacity: 1, y: 0, duration: 0.9, stagger: 0.09, ease: 'power3.out',
        scrollTrigger: { trigger: group, start: 'top 85%', once: true }
      });
    });

    // Section headlines via SplitType
    document.querySelectorAll('[data-split-scroll]').forEach((el) => {
      if (hasSplit){
        const split = new SplitType(el, { types: 'words' });
        gsap.set(split.words, { yPercent: 110, opacity: 0 });
        gsap.to(split.words, {
          yPercent: 0, opacity: 1, duration: 0.9, stagger: 0.02, ease: 'power4.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        });
      } else {
        gsap.to(el, { opacity: 1, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
      }
    });

    // Image mask reveals
    document.querySelectorAll('[data-mask-reveal]').forEach((el) => {
      gsap.set(el, { clipPath: 'inset(0 0 100% 0)' });
      gsap.to(el, {
        clipPath: 'inset(0 0 0% 0)', duration: 1.3, ease: 'power4.inOut',
        scrollTrigger: { trigger: el, start: 'top 82%', once: true }
      });
    });

    // Parallax media
    document.querySelectorAll('[data-parallax]').forEach((el) => {
      gsap.fromTo(el, { yPercent: -8 }, {
        yPercent: 8, ease: 'none',
        scrollTrigger: { trigger: el.closest('.about__media, .project-panel__media') || el, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  /* ============================================================
     WHY-US INTERACTIVE PRINCIPLES
     ============================================================ */
  function initWhyUs(){
    const items = document.querySelectorAll('.why__num-item');
    const images = document.querySelectorAll('.why__stage-media img');
    const titleEl = document.querySelector('[data-why-title]');
    const descEl = document.querySelector('[data-why-desc]');
    if (!items.length) return;

    function activate(i){
      items.forEach(it => it.classList.remove('is-active'));
      images.forEach(im => im.classList.remove('is-active'));
      items[i].classList.add('is-active');
      images[i] && images[i].classList.add('is-active');
      if (titleEl) titleEl.textContent = items[i].dataset.title;
      if (descEl) descEl.textContent = items[i].dataset.desc;
    }

    items.forEach((item, i) => {
      item.addEventListener('mouseenter', () => activate(i));
      item.addEventListener('click', () => activate(i));
      item.addEventListener('focus', () => activate(i));
    });
    activate(0);
  }

  /* ============================================================
     APPROACH VERTICAL TIMELINE
     ============================================================ */
  function initApproach(){
    const rail = document.querySelector('.approach__rail i');
    const stages = document.querySelectorAll('.approach__stage');
    if (!stages.length) return;

    if (hasGSAP && hasScrollTrigger && rail){
      gsap.to(rail, {
        height: '100%', ease: 'none',
        scrollTrigger: {
          trigger: '.approach__track', start: 'top 60%', end: 'bottom 60%', scrub: 0.6,
        }
      });
    }
    stages.forEach((stage) => {
      if (hasGSAP && hasScrollTrigger){
        ScrollTrigger.create({
          trigger: stage, start: 'top 65%', end: 'bottom 65%',
          onEnter: () => stage.classList.add('is-active'),
          onEnterBack: () => stage.classList.add('is-active'),
        });
      } else {
        stage.classList.add('is-active');
      }
    });
  }

  /* ============================================================
     PROJECT PANEL IMAGE SCALE ON SCROLL
     ============================================================ */
  function initProjectPanels(){
    if (!hasGSAP || !hasScrollTrigger) return;
    document.querySelectorAll('.project-panel__media img').forEach((img) => {
      gsap.fromTo(img, { scale: 1.18 }, {
        scale: 1, ease: 'none',
        scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  /* ============================================================
     FUTURE SECTION SCAN LINE
     ============================================================ */
  function initFutureScan(){
    const scan = document.querySelector('.future__scan');
    if (!scan) return;
    if (hasGSAP){
      gsap.to(scan, { top: '100%', duration: 3.4, ease: 'sine.inOut', repeat: -1, yoyo: true });
    }
  }

  /* ============================================================
     COUNTER ANIMATION (used only when real stats supplied)
     ============================================================ */
  function initCounters(){
    document.querySelectorAll('[data-counter]').forEach((el) => {
      const target = parseFloat(el.dataset.counter);
      if (Number.isNaN(target)) return;
      const obj = { val: 0 };
      const run = () => {
        if (hasGSAP){
          gsap.to(obj, {
            val: target, duration: 1.6, ease: 'power2.out',
            onUpdate: () => { el.textContent = Math.floor(obj.val).toString(); }
          });
        } else {
          el.textContent = target;
        }
      };
      if (hasScrollTrigger){
        ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: run });
      } else run();
    });
  }

  /* ============================================================
     START
     ============================================================ */
  function startPageAnimations(){
    initHeroSlider();
    initReveals();
    initWhyUs();
    initApproach();
    initProjectPanels();
    initFutureScan();
    initCounters();
    if (hasScrollTrigger) ScrollTrigger.refresh();
  }

  window.NPI_ANIMATIONS = { revealHeadline };
})();
