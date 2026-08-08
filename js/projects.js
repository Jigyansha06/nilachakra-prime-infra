/* ============================================================
   PROJECTS.JS
   Project panel micro-interactions on the homepage, and the
   cursor label wiring for "VIEW PROJECT" on hover.
   Swap PROJECT_DATA below with real project data when supplied
   — nothing else needs to change.
   ============================================================ */

(function(){
  const PROJECT_DATA = [
    {
      id: 1,
      name: '[Project Name]',
      location: '[Location, Odisha]',
      type: '[Residential / Commercial / Plotted Development / Infrastructure]',
      status: '[Upcoming / Ongoing / Completed]',
    },
    {
      id: 2,
      name: '[Project Name]',
      location: '[Location, Odisha]',
      type: '[Residential / Commercial / Plotted Development / Infrastructure]',
      status: '[Upcoming / Ongoing / Completed]',
    },
    {
      id: 3,
      name: '[Project Name]',
      location: '[Location, Odisha]',
      type: '[Residential / Commercial / Plotted Development / Infrastructure]',
      status: '[Upcoming / Ongoing / Completed]',
    },
  ];
  window.NPI_PROJECTS = PROJECT_DATA;

  document.querySelectorAll('.project-panel [data-cursor-label]').forEach((link) => {
    link.setAttribute('data-cursor-label', 'VIEW PROJECT');
  });

  // Hover tilt on project media (desktop only, subtle)
  const isCoarse = window.matchMedia('(hover:none), (pointer:coarse)').matches;
  if (!isCoarse && typeof gsap !== 'undefined'){
    document.querySelectorAll('.project-panel__media').forEach((media) => {
      const img = media.querySelector('img');
      media.addEventListener('mousemove', (e) => {
        const r = media.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        gsap.to(img, { x: px * 14, y: py * 14, duration: 0.6, ease: 'power2.out' });
      });
      media.addEventListener('mouseleave', () => {
        gsap.to(img, { x: 0, y: 0, duration: 0.8, ease: 'power3.out' });
      });
    });
  }
})();
