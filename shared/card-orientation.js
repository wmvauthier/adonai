// Presentation-only rotation. Original card files remain untouched for integrations.
(() => {
  const root = new URL('../', document.currentScript.src);
  const cache = new Map();
  const pending = new WeakMap();
  const read = async path => {
    const response = await fetch(new URL(path, root));
    if (!response.ok) throw new Error(`Card orientation: ${response.status}`);
    return response.json();
  };
  Promise.all([read('data/game/cards.json'), read('data/refs/types.json')]).then(([catalog, refs]) => {
    const horizontalTypes = new Set(refs.types.filter(type => ['TEM', 'TER'].includes(type.code)).map(type => type.id));
    const sources = new Set(catalog.cards.filter(card => card.type.some(type => horizontalTypes.has(type)) && card.images?.card).map(card => new URL(card.images.card, new URL('cards/', root)).href));
    const horizontalImage = source => {
      if (!cache.has(source)) cache.set(source, new Promise(resolve => {
        const image = new Image();
        image.onload = () => {
          if (image.naturalWidth >= image.naturalHeight) { resolve(source); return; }
          try {
            const canvas = document.createElement('canvas');
            canvas.width = image.naturalHeight;
            canvas.height = image.naturalWidth;
            const ctx = canvas.getContext('2d');
            ctx.translate(canvas.width, 0);
            ctx.rotate(Math.PI / 2);
            ctx.drawImage(image, 0, 0);
            canvas.toBlob(blob => resolve(blob ? URL.createObjectURL(blob) : source), 'image/png');
          } catch { resolve(source); }
        };
        image.onerror = () => resolve(source);
        image.src = source;
      }));
      return cache.get(source);
    };
    const update = image => {
      const source = image.src;
      if (!sources.has(source) || pending.get(image) === source) return;
      pending.set(image, source);
      horizontalImage(source).then(url => {
        if (image.src !== source) return;
        if (url !== source) image.src = url;
        image.style.objectFit = 'contain';
        image.dataset.cardOrientation = 'landscape';
      });
    };
    const scan = node => {
      if (node.nodeType !== 1) return;
      if (node.matches('img')) update(node);
      node.querySelectorAll('img').forEach(update);
    };
    scan(document.documentElement);
    new MutationObserver(records => records.forEach(record => {
      if (record.type === 'attributes') {
        pending.delete(record.target);
        update(record.target);
      } else record.addedNodes.forEach(scan);
    })).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['src'] });
  }).catch(error => console.warn('Orientação das cartas:', error));
})();
