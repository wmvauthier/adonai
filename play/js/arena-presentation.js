/* Short, non-blocking phase cues. No polling or game-state mutations. */
(() => {
  const board = document.getElementById('gameView');
  const indicator = document.getElementById('phaseIndicator');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const cue = document.createElement('div');
  cue.className = 'arena-phase-cue';
  cue.setAttribute('aria-hidden', 'true');
  cue.hidden = true;
  document.body.append(cue);
  let previous = '';
  let animation;
  let timer;
  const observer = new MutationObserver(() => {
    const phase = indicator.textContent.trim();
    if (board.classList.contains('is-hidden')) {
      previous = '';
      clearTimeout(timer);
      animation?.cancel();
      cue.hidden = true;
      return;
    }
    const signature = `${document.getElementById('phasePanel').className}:${phase}`;
    if (!phase || phase === '-' || signature === previous) return;
    previous = signature;
    clearTimeout(timer);
    animation?.cancel();
    cue.textContent = phase;
    cue.hidden = false;
    if (!reducedMotion.matches) {
      animation = cue.animate([
        { opacity: 0, translate: '0 10px' },
        { opacity: 1, translate: '0 0', offset: .18 },
        { opacity: 1, translate: '0 0', offset: .75 },
        { opacity: 0, translate: '0 -6px' }
      ], { duration: 1400, easing: 'ease-out' });
    }
    timer = setTimeout(() => { cue.hidden = true; }, 1400);
  });
  observer.observe(indicator, { childList: true, characterData: true, subtree: true });
  observer.observe(board, { attributes: true, attributeFilter: ['class'] });
})();
