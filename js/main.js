/* ============================================================
   MAIN.JS
   Site glue: contact form behavior, footer year, floating labels.
   Load this file last, after navigation.js and animations.js.
   ============================================================ */

(function(){
  /* ---- Footer year ---- */
  const yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Floating label state (keeps label up if field has a value) ---- */
  document.querySelectorAll('.form-field input, .form-field textarea').forEach((field) => {
    const wrap = field.closest('.form-field');
    const sync = () => wrap.classList.toggle('is-filled', field.value.trim().length > 0);
    field.addEventListener('input', sync);
    field.addEventListener('blur', sync);
    sync();
  });

  /* ---- Contact form submit (front-end only — wire to real endpoint later) ---- */
  const form = document.querySelector('.contact__form');
  const status = document.querySelector('.form-status');
  if (form){
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const required = form.querySelectorAll('[required]');
      let valid = true;
      required.forEach((field) => { if (!field.value.trim()) valid = false; });

      if (!valid){
        if (status) status.textContent = 'Please complete all required fields.';
        return;
      }

      if (status) status.textContent = 'Sending enquiry…';
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.setAttribute('disabled', 'true');

      // Placeholder: replace with a real submission endpoint (e.g. fetch to a form API).
      setTimeout(() => {
        if (status) status.textContent = 'Thank you — your enquiry has been received. Our team will get back to you shortly.';
        form.reset();
        form.querySelectorAll('.form-field').forEach(f => f.classList.remove('is-filled'));
        if (submitBtn) submitBtn.removeAttribute('disabled');
      }, 900);
    });
  }

  /* ---- Skip-link focus fix for smooth-scroll setups ---- */
  const skipLink = document.querySelector('.skip-link');
  if (skipLink){
    skipLink.addEventListener('click', () => {
      const target = document.querySelector(skipLink.getAttribute('href'));
      if (target) target.setAttribute('tabindex', '-1');
    });
  }
})();
