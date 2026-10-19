/**
 * Butter-smooth momentum scroll — lerp-based, same feel as cursor
 * Works on all modern browsers, no library needed.
 */

let _scrollCurrent = 0;   // rendered scroll position
let _scrollTarget  = 0;   // where we want to be
let _scrollRAF     = null;
let _scrollEase    = 0.092; // lower = smoother / slower (0.06–0.12 sweet spot)

function lerpScroll(a, b, t) { return a + (b - a) * t; }

function tickScroll() {
  const diff = _scrollTarget - _scrollCurrent;

  if (Math.abs(diff) < 0.5) {
    // Close enough — snap and stop
    _scrollCurrent = _scrollTarget;
    window.scrollTo(0, _scrollCurrent);
    _scrollRAF = null;
    return;
  }

  _scrollCurrent = lerpScroll(_scrollCurrent, _scrollTarget, _scrollEase);
  window.scrollTo(0, _scrollCurrent);
  _scrollRAF = requestAnimationFrame(tickScroll);
}

function smoothScrollTo(y) {
  _scrollTarget = Math.max(0, Math.min(y, document.body.scrollHeight - window.innerHeight));
  if (!_scrollRAF) _scrollRAF = requestAnimationFrame(tickScroll);
}

function initSmoothScroll() {
  // Skip on touch/mobile — native momentum scroll is better there
  if (window.matchMedia('(hover: none)').matches) {
    // Still handle anchor clicks on mobile
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        document.querySelector('.nav-mobile')?.classList.remove('open');
      });
    });
    return;
  }

  // Sync current position on load
  _scrollCurrent = window.scrollY;
  _scrollTarget  = window.scrollY;

  // Intercept wheel events — drive our own scroll
  window.addEventListener('wheel', (e) => {
    e.preventDefault();
    // Normalise delta across browsers/trackpads
    let delta = e.deltaY;
    if (e.deltaMode === 1) delta *= 28;       // Firefox line mode
    if (e.deltaMode === 2) delta *= window.innerHeight; // page mode

    // Trackpad pinch guard — very small deltas = trackpad, scale down
    const isTrackpad = Math.abs(delta) < 50;
    delta *= isTrackpad ? 0.85 : 1.0;

    _scrollTarget += delta * 1.1;
    smoothScrollTo(_scrollTarget);
  }, { passive: false });

  // Keyboard scroll (arrow keys, page up/down, space)
  window.addEventListener('keydown', (e) => {
    const map = {
      ArrowDown:  80,
      ArrowUp:   -80,
      PageDown:   window.innerHeight * 0.88,
      PageUp:    -window.innerHeight * 0.88,
      Space:      window.innerHeight * 0.88,
      End:        document.body.scrollHeight,
      Home:       -document.body.scrollHeight,
    };
    if (e.shiftKey && e.key === 'Space') {
      e.preventDefault();
      smoothScrollTo(_scrollTarget - window.innerHeight * 0.88);
      return;
    }
    if (map[e.key] !== undefined && document.activeElement === document.body) {
      e.preventDefault();
      smoothScrollTo(_scrollTarget + map[e.key]);
    }
  });

  // Keep _scrollTarget in sync if programmatic scroll happens (e.g. browser back)
  window.addEventListener('scroll', () => {
    if (!_scrollRAF) {
      _scrollCurrent = window.scrollY;
      _scrollTarget  = window.scrollY;
    }
  }, { passive: true });

  // Anchor link clicks — smooth glide to section
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY;
      smoothScrollTo(y);
      document.querySelector('.nav-mobile')?.classList.remove('open');
    });
  });
}

/**
 * Parallax on scroll for hero elements
 */
function initParallax() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = _scrollCurrent || window.scrollY;
        const heroHeight = hero.offsetHeight;
        if (scrollY > heroHeight) { ticking = false; return; }

        const progress = scrollY / heroHeight;

        // Parallax hero content
        const heroContent = hero.querySelector('.hero-content');
        if (heroContent) {
          heroContent.style.transform = `translateY(${scrollY * 0.35}px)`;
          heroContent.style.opacity = 1 - progress * 1.5;
        }

        // Parallax grid
        const grid = hero.querySelector('.hero-grid');
        if (grid) {
          grid.style.transform = `translateY(${scrollY * 0.15}px)`;
        }

        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
}
