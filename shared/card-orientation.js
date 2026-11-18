// Rotate the HTML image only: its src/currentSrc remain the original asset URL.
(() => {
  const root = new URL('../', document.currentScript.src);
  const read = async path => {
    const response = await fetch(new URL(path, root));
    if (!response.ok) throw new Error(`Card orientation: ${response.status}`);
    return response.json();
  };
  Promise.all([read('data/game/cards.json'), read('data/refs/types.json')]).then(([catalog, refs]) => {
    const horizontalTypes = new Set(refs.types.filter(type => ['TEM', 'TER'].includes(type.code)).map(type => type.id));
    const sources = new Set(catalog.cards.filter(card => card.type.some(type => horizontalTypes.has(type)) && card.images?.card).map(card => new URL(card.images.card, new URL('cards/', root)).href));
    const style = document.createElement('style');
    style.textContent = `
      .card-orientation-frame { position:relative; display:block; width:100%; max-width:100%; min-width:0; flex-shrink:0; aspect-ratio:var(--card-horizontal-ratio); }
      :is(.card-entry-media,.detail-art) > .card-orientation-frame { height:100%; aspect-ratio:auto; }
      :is(.identity-board-slot,.drawer-identity-slot) > .card-orientation-frame { width:95%; }
      .identity-slot > .card-orientation-frame { width:100%; }
    `;
    document.head.append(style);
    const frames = new Map();
    const watched = new WeakSet();
    const fit = frame => {
      const image = frame.querySelector('img');
      if (!image || !image.naturalWidth || !image.naturalHeight) return;
      const scale = Math.min(frame.clientWidth / image.naturalHeight, frame.clientHeight / image.naturalWidth);
      if (!scale) return;
      image.style.setProperty('width', `${image.naturalWidth * scale}px`, 'important');
      image.style.setProperty('height', `${image.naturalHeight * scale}px`, 'important');
    };
    const resize = new ResizeObserver(entries => entries.forEach(entry => fit(entry.target)));
    const restore = image => {
      const entry = frames.get(image);
      if (!entry) return;
      resize.unobserve(entry.frame);
      if (entry.frame.parentNode) entry.frame.replaceWith(image);
      if (entry.originalStyle === null) image.removeAttribute('style');
      else image.setAttribute('style', entry.originalStyle);
      delete image.dataset.cardOrientation;
      frames.delete(image);
    };
    const update = image => {
      if (!sources.has(image.src)) { restore(image); return; }
      if (!watched.has(image)) {
        watched.add(image);
        image.addEventListener('load', () => update(image));
        image.addEventListener('error', () => restore(image));
      }
      if (!image.complete || !image.naturalWidth) return;
      if (image.naturalWidth >= image.naturalHeight) { restore(image); return; }
      let entry = frames.get(image);
      if (!entry) {
        const frame = document.createElement('span');
        frame.className = 'card-orientation-frame';
        entry = { frame, originalStyle: image.getAttribute('style') };
        frames.set(image, entry);
        image.replaceWith(frame);
        frame.append(image);
        // Inline geometry overrides thumbnail sizes without touching the source file.
        for (const [property, value] of Object.entries({ position:'absolute', left:'50%', top:'50%', right:'auto', bottom:'auto', 'max-width':'none', 'max-height':'none', 'min-width':'0', 'min-height':'0', margin:'0', 'aspect-ratio':'auto', 'object-fit':'contain', transform:'translate(-50%, -50%) rotate(90deg)', 'transform-origin':'center', transition:'none' })) {
          image.style.setProperty(property, value, 'important');
        }
        resize.observe(frame);
      }
      entry.frame.style.setProperty('--card-horizontal-ratio', `${image.naturalHeight} / ${image.naturalWidth}`);
      image.dataset.cardOrientation = 'landscape';
      fit(entry.frame);
    };
    const scan = node => {
      if (node.nodeType !== 1) return;
      if (node.matches('img')) update(node);
      node.querySelectorAll('img').forEach(update);
    };
    scan(document.documentElement);
    new MutationObserver(records => {
      records.forEach(record => {
        if (record.type === 'attributes') update(record.target);
        else record.addedNodes.forEach(scan);
      });
      for (const [image, entry] of frames) {
        if (!image.isConnected) { resize.unobserve(entry.frame); frames.delete(image); }
      }
    }).observe(document.documentElement, { subtree:true, childList:true, attributes:true, attributeFilter:['src'] });
  }).catch(error => console.warn('Orientação das cartas:', error));
})();
