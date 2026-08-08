/* ============================================================
   NAVIGATION.JS
   Transparent -> glass nav, mobile menu, active section link,
   magnetic hover on nav CTA.
   ============================================================ */

(function(){
  const nav = document.querySelector('.nav');
  const burger = document.querySelector('.nav__burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const navLinks = document.querySelectorAll('.nav__links a, .mobile-menu a');
  const sections = document.querySelectorAll('[data-nav-section]');

  if (!nav) return;

  /* ---- Scroll state ---- */
  const setScrollState = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    nav.classList.toggle('is-scrolled', y > 40);
  };
  setScrollState();
  window.addEventListener('scroll', setScrollState, { passive: true });

  /* ---- Mobile menu ---- */
  if (burger && mobileMenu){
    burger.setAttribute('aria-expanded', 'false');
    burger.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      mobileMenu.classList.toggle('is-open', isOpen);
      burger.setAttribute('aria-expanded', String(isOpen));
      document.documentElement.style.overflow = isOpen ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('is-open');
        mobileMenu.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        document.documentElement.style.overflow = '';
      });
    });
  }

  /* ---- Active link on scroll ---- */
  if ('IntersectionObserver' in window && sections.length){
    const map = new Map();
    navLinks.forEach(link => {
      const id = link.getAttribute('href');
      if (id && id.startsWith('#')) map.set(id.slice(1), link);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const link = map.get(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting){
          navLinks.forEach(l => l.classList.remove('is-active'));
          link.classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

    sections.forEach(s => observer.observe(s));
  }

  /* ---- Magnetic CTA + nav links (desktop only) ---- */
  const isCoarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (!isCoarse){
    document.querySelectorAll('.btn:not(.btn--ghost)').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.32}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
    document.querySelectorAll('.nav__links a').forEach(link => {
      link.addEventListener('mousemove', (e) => {
        const r = link.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        link.style.transform = `translateX(${x * 0.16}px)`;
      });
      link.addEventListener('mouseleave', () => { link.style.transform = ''; });
    });
  }

  /* ---- Smooth anchor scrolling ----
     Route internal hash links through Lenis (when present) so
     in-page navigation feels like part of the same continuous,
     cinematic scroll rather than a hard jump. Falls back to native
     smooth scroll if Lenis hasn't loaded (e.g. offline preview). */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;
    link.addEventListener('click', (e) => {
      const target = document.querySelector(targetId);
      if (!target) return;
      e.preventDefault();
      if (window.NPI_LENIS){
        window.NPI_LENIS.scrollTo(target, { offset: -12, duration: 1.4 });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      history.pushState(null, '', targetId);
    });
  });

  window.NPI_NAV_READY = true;
})();
/* Smooth mobile touch cursor */
const cursor = document.querySelector('.cursor');

if (cursor) {
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let visible = false;

  document.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];

    targetX = touch.clientX;
    targetY = touch.clientY;
    currentX = targetX;
    currentY = targetY;

    cursor.style.transform =
      `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;

    cursor.classList.add('is-visible');
    visible = true;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];

    targetX = touch.clientX;
    targetY = touch.clientY;
  }, { passive: true });

  document.addEventListener('touchend', () => {
    cursor.classList.remove('is-visible');
    visible = false;
  }, { passive: true });

  function animateCursor() {
    if (visible) {
      currentX += (targetX - currentX) * 0.22;
      currentY += (targetY - currentY) * 0.22;

      cursor.style.transform =
        `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
    }

    requestAnimationFrame(animateCursor);
  }

  animateCursor();
}