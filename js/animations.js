/**
 * IntersectionObserver-based reveal animations
 */

function initAnimations() {
  // Reveal elements
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  // Stagger children
  const staggerObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        staggerObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.stagger-children').forEach(el => staggerObs.observe(el));
}

/**
 * Section transition with color accent
 */
function initSectionTransitions() {
  const sections = document.querySelectorAll('[data-accent]');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const color = entry.target.dataset.accent;
        document.documentElement.style.setProperty('--current-accent', color);
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => obs.observe(s));
}
