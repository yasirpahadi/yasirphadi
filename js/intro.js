/**
 * Cinematic intro animation - YASIRPAHADI
 * Runs only once per session
 */

function initIntro(onComplete) {
  const intro = document.getElementById('intro-screen');
  if (!intro) { onComplete?.(); return; }

  // Always play intro on every load

  const lightningEl = document.getElementById('intro-lightning');
  const letters = intro.querySelectorAll('.intro-letter');
  const sweep = intro.querySelector('.intro-light-sweep');
  const lineTop = intro.querySelector('.intro-line-top');
  const lineBottom = intro.querySelector('.intro-line-bottom');

  let letterIndex = 0;
  const LETTER_INTERVAL = 155;  // ms between letters
  const REVEAL_AFTER = letters.length * LETTER_INTERVAL + 200;

  // Fire lightning first
  setTimeout(() => { lightningEl && lightningEl.classList.add('strike'); }, 280);

  // Reveal letters one by one
  function revealNext() {
    if (letterIndex >= letters.length) return;
    letters[letterIndex].classList.add('revealed');
    letterIndex++;
    if (letterIndex < letters.length) {
      setTimeout(revealNext, LETTER_INTERVAL);
    }
  }

  // Sequence
  setTimeout(revealNext, 1500);

  // Line expand after all letters
  setTimeout(() => {
    lineTop?.classList.add('expand');
    lineBottom?.classList.add('expand');
  }, REVEAL_AFTER + 250);

  // Light sweep
  setTimeout(() => {
    sweep?.classList.add('sweep');
  }, REVEAL_AFTER + 650);

  // Hold then fade out
  setTimeout(() => {
    intro.classList.add('fade-out');
    onComplete?.();
    setTimeout(() => {
      intro.classList.add('hidden');
      // intro complete
    }, 1200);
  }, REVEAL_AFTER + 3000);
}
