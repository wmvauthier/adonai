(() => {
  const section = document.getElementById('reviews');
  const track = document.querySelector('[data-render="reviews"]');
  if (!section || !track) return;
  const root = new URL('../', document.currentScript.src);
  const fallback = new URL('assets/logo/adonai_logo_base-4.webp', root).href;
  let reviews = [];
  const text = (value, lang) => typeof value === 'string' ? value : value?.[lang] || value?.pt || value?.en || '';
  const safeUrl = value => {
    if (typeof value !== 'string' || !value.trim()) return '';
    try {
      const url = new URL(value, root);
      return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
    } catch { return ''; }
  };
  const dateValue = value => {
    const match = String(value || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    const date = match ? new Date(+match[3], +match[2] - 1, +match[1]) : new Date(value || 0);
    return Number.isFinite(date.getTime()) ? date.getTime() : 0;
  };
  // Same priority + recency score used by the Gallery highlights.
  const sortReviews = items => {
    const latest = Math.max(0, ...items.map(item => item.dateValue));
    const score = item => Math.max(0, 180 - Math.max(0, Math.floor((latest - item.dateValue) / 86400000))) + item.priority * 24;
    return items.sort((a, b) => score(b) - score(a) || b.dateValue - a.dateValue);
  };
  const render = () => {
    const lang = document.documentElement.lang === 'en' ? 'en' : 'pt';
    track.replaceChildren();
    sortReviews(reviews.filter(item => item.enabled !== false && item.name?.trim() && safeUrl(item.url) && text(item.review || item.quote, lang).trim())).forEach(item => {
      const card = document.createElement('figure');
      card.className = 'home-review testimonial';
      const quote = document.createElement('blockquote');
      quote.textContent = `“${text(item.review || item.quote, lang).trim()}”`;
      const attribution = document.createElement('figcaption');
      const image = document.createElement('img');
      image.src = item.avatar || fallback;
      image.alt = '';
      image.loading = 'lazy';
      image.addEventListener('error', () => { image.src = fallback; }, { once: true });
      const copy = document.createElement('div');
      const name = document.createElement('strong');
      name.textContent = item.name;
      const link = document.createElement('a');
      link.href = safeUrl(item.url);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'home-review-label';
      link.textContent = lang === 'pt' ? 'Ver review completo ↗' : 'Watch full review ↗';
      copy.append(name, link);
      attribution.append(image, copy);
      card.append(quote, attribution);
      if (item.provisional === true) {
        const note = document.createElement('small');
        note.className = 'testimonial-note';
        note.textContent = lang === 'pt' ? 'Frase provisória · citação a confirmar' : 'Placeholder text · quote pending confirmation';
        card.append(note);
      }
      track.append(card);
    });
    section.hidden = !track.childElementCount;
  };
  const read = async file => {
    const response = await fetch(new URL(`data/content/${file}.json`, root));
    if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  };
  document.addEventListener('home:language', render);
  Promise.all([read('reviews'), read('youtube').catch(() => []), read('instagram').catch(() => [])]).then(([items, youtube, instagram]) => {
    const sources = [...youtube, ...instagram];
    reviews = items.filter(item => item && typeof item.name === 'string').map(item => {
      const source = sources.find(source => source.url === item.url);
      const avatarSource = sources.find(source => source.url === item.avatarSource) || source;
      // Legacy Instagram paths are relative to its former page, not the site root.
      const avatar = (avatarSource?.avatar || '').replace(/^\.\/img\/instagram\//, 'gallery/review/instagram/avatar/');
      return { ...item, avatar: safeUrl(avatar) || fallback,
        priority: Number(item.priority ?? source?.priority) || 0,
        dateValue: dateValue(item.date || source?.date) };
    });
    render();
  }).catch(error => {
    section.hidden = true;
    console.error('Não foi possível carregar os reviews.', error);
  });
})();
