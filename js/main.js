/**
 * main.js — orchestrates all modules
 */

// Project filter
function initProjectFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projCards = document.querySelectorAll('.proj-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      projCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
          card.style.display = '';
          card.style.animation = 'scaleIn 0.4s cubic-bezier(0.22,1,0.36,1) forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// Typing effect for hero tagline
function initTyping() {
  const el = document.querySelector('.hero-typing');
  if (!el) return;

  const words = ['Developer', 'AI Builder', 'Filmmaker', 'Designer'];
  let wordIdx = 0, charIdx = 0, deleting = false;

  function type() {
    const word = words[wordIdx];
    if (deleting) {
      el.textContent = word.substring(0, charIdx - 1);
      charIdx--;
    } else {
      el.textContent = word.substring(0, charIdx + 1);
      charIdx++;
    }

    let delay = deleting ? 60 : 100;

    if (!deleting && charIdx === word.length) {
      delay = 2200;
      deleting = true;
    } else if (deleting && charIdx === 0) {
      deleting = false;
      wordIdx = (wordIdx + 1) % words.length;
      delay = 300;
    }

    setTimeout(type, delay);
  }

  setTimeout(type, 800);
}

// Skills section color assignment
function initSkillCards() {
  const colorMap = {
    web: { glow: 'rgba(79,158,255,0.06)', border: 'rgba(79,158,255,0.2)' },
    ai:  { glow: 'rgba(167,139,250,0.06)', border: 'rgba(167,139,250,0.2)' },
    film:{ glow: 'rgba(255,140,90,0.06)', border: 'rgba(255,140,90,0.2)' },
    design:{ glow: 'rgba(52,211,153,0.06)', border: 'rgba(52,211,153,0.2)' },
  };

  document.querySelectorAll('.skill-card[data-domain]').forEach(card => {
    const domain = card.dataset.domain;
    if (colorMap[domain]) {
      card.style.setProperty('--card-glow', colorMap[domain].glow);
      card.style.setProperty('--card-border', colorMap[domain].border);
    }
  });
}

// Boot sequence
function boot() {
  // Start non-blocking inits immediately
  initCursor();
  initAmbientLights();

  // Start intro, then reveal the rest
  initIntro(() => {
    document.body.classList.add('intro-complete');
    initNavigation();
    initSmoothScroll();
    initParallax();
    initAnimations();
    initSectionTransitions();
    initLighting();
    initProjectFilter();
    initTyping();
    initSkillCards();
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
