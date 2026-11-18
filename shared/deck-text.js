// TCGArena text interchange, also importable by Node tests without dependencies.
((root) => {
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').replace(/\s+/g, ' ').trim();
  const name = card => typeof card.name === 'string' ? card.name : card.name.pt || card.name.en;
  function exportText(ids, cards, virtues) {
    const counts = new Map();
    ids.forEach(id => {
      const card = cards.get(id);
      if (!card) throw new Error(`Carta não encontrada: ${id}`);
      const label = name(card);
      counts.set(label, (counts.get(label) || 0) + 1);
    });
    const lines = [...counts].map(([label, quantity]) => `${quantity} ${label}`);
    const virtueNames = [...new Set(virtues.map(name))];
    // Insert virtue cards after the identity (callers pass identity IDs first).
    const identityNames = new Set(ids.filter(id => /-(CMP|TEM|TER)-/.test(id)).map(id => name(cards.get(id))));
    const identityLines = lines.filter(line => identityNames.has(line.replace(/^\d+ /, '')));
    const mainLines = lines.filter(line => !identityNames.has(line.replace(/^\d+ /, '')));
    return [...identityLines, ...virtueNames.map(label => `1 ${label}`), ...mainLines, 'Sideboard:'].join('\n');
  }
  function importText(input, cards, virtues) {
    const names = new Map();
    for (const [id, card] of cards) {
      for (const label of new Set([name(card), ...(typeof card.name === 'object' ? Object.values(card.name) : [])].map(normalize))) {
        if (!names.has(label)) names.set(label, []);
        names.get(label).push(id);
      }
    }
    const ignoredNames = new Set(virtues.flatMap(card => typeof card.name === 'object' ? Object.values(card.name) : [card.name]).map(normalize));
    const result = { ids: [], errors: [], ignoredVirtues: 0, sideboard: 0 };
    const seen = new Set();
    let inSideboard = false;
    String(input).split(/\r?\n/).forEach((raw, index) => {
      let line = raw.trim();
      if (!line) return;
      if (/^sideboard\s*:/i.test(line)) {
        inSideboard = true;
        line = line.replace(/^sideboard\s*:/i, '').trim();
        if (!line) return;
      }
      if (inSideboard) { result.sideboard += 1; return; }
      const legacy = line.match(/^-?\s*\[([A-Z0-9]+-[A-Z]+-\d+)\]/i);
      const entry = line.match(/^(\d+)\s+(.+)$/);
      const direct = cards.has(line) ? line : null;
      if (!legacy && !entry && !direct) { result.errors.push(`Linha ${index + 1}: use quantidade e nome da carta.`); return; }
      const quantity = entry ? Number(entry[1]) : 1;
      if (!Number.isSafeInteger(quantity) || quantity < 1) { result.errors.push(`Linha ${index + 1}: quantidade inválida.`); return; }
      if (entry && ignoredNames.has(normalize(entry[2]))) { result.ignoredVirtues += quantity; return; }
      const candidates = legacy || direct ? [legacy ? legacy[1].toUpperCase() : direct] : names.get(normalize(entry[2])) || [];
      // Some cards differ only in capitalization (champion Jessé vs. character Jessé).
      const exact = entry ? candidates.filter(id => {
        const card = cards.get(id);
        return card && [name(card), ...(typeof card.name === 'object' ? Object.values(card.name) : [])].includes(entry[2].trim());
      }) : [];
      const matches = exact.length === 1 ? exact : candidates;
      if (matches.length !== 1 || !cards.has(matches[0])) { result.errors.push(`Linha ${index + 1}: carta desconhecida ou nome ambíguo (${entry?.[2] || line}).`); return; }
      const id = matches[0];
      if (quantity !== 1 || seen.has(id)) { result.errors.push(`Linha ${index + 1}: este deckbuilder aceita apenas uma cópia de cada carta.`); return; }
      seen.add(id);
      result.ids.push(id);
    });
    return result;
  }
  root.AdonaiDeckText = { exportText, importText };
})(globalThis);
