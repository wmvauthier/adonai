const decksData = [
  {
    id: 1,
    name: { pt: 'Coroa da Aurora', en: 'Crown of Dawn' },
    tier: 'S',
    style: 'Midrange',
    virtue: 'Justiça',
    shell: { pt: 'Midrange de pressão', en: 'Pressure midrange' },
    image: 'https://picsum.photos/seed/deck-aurora/1200/820',
    power: 97,
    speed: 3,
    matchup: 92,
    pilot: { pt: 'Curva limpa, mesa dominante e ótimo fechamento.', en: 'Clean curve, dominant board, and excellent closing power.' },
    description: {
      pt: 'Deck premium de curva sólida que assume a mesa cedo e converte vantagem incremental em pressão inevitável.',
      en: 'A premium solid-curve deck that takes the board early and turns incremental advantage into inevitable pressure.'
    },
    strengths: {
      pt: ['Excelente contra midrange espelhado', 'Transições fortes do turno 3 ao 6', 'Mantém pressão sem superextender'],
      en: ['Excellent into mirrored midrange', 'Strong transitions from turn 3 to 6', 'Maintains pressure without overextending']
    },
    weaknesses: {
      pt: ['Pode sofrer contra remoções em massa bem cronometradas', 'Menos explosivo contra combo puro'],
      en: ['Can struggle into well-timed mass removal', 'Less explosive against pure combo']
    },
    gameplan: {
      pt: 'Procure curva inicial funcional, preserve recursos premium para a virada e force trades eficientes até abrir janela de letal.',
      en: 'Look for a functional opener, preserve premium resources for the pivot turn, and force efficient trades until a lethal window opens.'
    },
    tags: ['Board Control', 'Value Curve', 'Tournament'],
    topMatchups: { pt: ['Tempo de Sabedoria', 'Espelhos de Justiça'], en: ['Wisdom Tempo', 'Justice Mirrors'] },
    badMatchups: { pt: ['Combo Celestial'], en: ['Celestial Combo'] },
    metaRead: {
      pt: 'É o referencial do formato. Obriga o resto do meta a respeitar presença de mesa e remoções eficientes.',
      en: 'It is the reference deck of the format. It forces the rest of the meta to respect board presence and efficient removal.'
    }
  },
  {
    id: 2,
    name: { pt: 'Véu do Scriptorium', en: 'Scriptorium Veil' },
    tier: 'S',
    style: 'Control',
    virtue: 'Sabedoria',
    shell: { pt: 'Control reativo', en: 'Reactive control' },
    image: 'https://picsum.photos/seed/deck-scriptorium/1200/820',
    power: 95,
    speed: 2,
    matchup: 90,
    pilot: { pt: 'Controle refinado para mesas abertas e jogadores pacientes.', en: 'Refined control for open fields and patient pilots.' },
    description: {
      pt: 'Arquétipo de respostas premium, compra de cartas e fechamento tardio, ideal para ler o meta e punir sequências lineares.',
      en: 'An archetype of premium answers, card draw, and late closing power, ideal for reading the meta and punishing linear sequences.'
    },
    strengths: {
      pt: ['Ótimo contra aggro e tempo', 'Acesso consistente a respostas', 'Late game superior'],
      en: ['Great against aggro and tempo', 'Consistent access to answers', 'Superior late game']
    },
    weaknesses: {
      pt: ['Pilotagem mais exigente', 'Pode perder terreno para combos rápidos'],
      en: ['Higher pilot skill requirement', 'Can lose ground to fast combos']
    },
    gameplan: {
      pt: 'Troque recursos de forma eficiente, estabilize a vida e empilhe valor até o oponente ficar sem alcance.',
      en: 'Trade resources efficiently, stabilize life, and stack value until the opponent runs out of reach.'
    },
    tags: ['Reactive', 'Card Draw', 'Late Game'],
    topMatchups: { pt: ['Aggro de Fé', 'Tempo híbrido'], en: ['Faith Aggro', 'Hybrid Tempo'] },
    badMatchups: { pt: ['Combo de profecia'], en: ['Prophecy Combo'] },
    metaRead: {
      pt: 'Escolha forte em metas agressivos. Recompensa leitura profunda e side planning rigoroso.',
      en: 'A strong choice in aggressive metas. Rewards deep reads and rigorous side planning.'
    }
  },
  {
    id: 3,
    name: { pt: 'Marcha dos Fiéis', en: 'March of the Faithful' },
    tier: 'A',
    style: 'Aggro',
    virtue: 'Fé',
    shell: { pt: 'Aggro wide', en: 'Wide aggro' },
    image: 'https://picsum.photos/seed/deck-faithful/1200/820',
    power: 88,
    speed: 1,
    matchup: 80,
    pilot: { pt: 'Pressão imediata e ótimo uso de janelas pequenas.', en: 'Immediate pressure and excellent use of small windows.' },
    description: {
      pt: 'Lista de pressão horizontal para punir mulligans lentos e decks que gastam os primeiros turnos preparando valor.',
      en: 'A horizontal pressure list built to punish slow mulligans and decks that spend the early turns setting up value.'
    },
    strengths: {
      pt: ['Melhor abertura média do formato', 'Pune mãos lentas', 'Converte buffs em letal cedo'],
      en: ['Best average opener in the format', 'Punishes slow hands', 'Converts buffs into early lethal']
    },
    weaknesses: {
      pt: ['Perde força após sweepers', 'Depende bastante do turno 1'],
      en: ['Loses strength after sweepers', 'Relies heavily on turn 1']
    },
    gameplan: {
      pt: 'Busque ocupação rápida da mesa, force dano marginal em todo turno e feche antes da estabilização inimiga.',
      en: 'Look for rapid board occupation, force marginal damage every turn, and close before the opponent stabilizes.'
    },
    tags: ['Fast Ladder', 'Punish', 'Linear'],
    topMatchups: { pt: ['Control lento'], en: ['Slow control'] },
    badMatchups: { pt: ['Scriptorium', 'Remoção em massa'], en: ['Scriptorium', 'Mass removal'] },
    metaRead: {
      pt: 'Excelente para ladder e metas gananciosos, mas exige leitura de field para torneio longo.',
      en: 'Excellent for ladder and greedy fields, but needs field reading for long tournaments.'
    }
  },
  {
    id: 4,
    name: { pt: 'Ordem da Balança', en: 'Order of the Scale' },
    tier: 'A',
    style: 'Tempo',
    virtue: 'Justiça',
    shell: { pt: 'Tempo técnico', en: 'Technical tempo' },
    image: 'https://picsum.photos/seed/deck-scale/1200/820',
    power: 86,
    speed: 2,
    matchup: 84,
    pilot: { pt: 'Deck de microvantagens, pressão e proteção.', en: 'A deck of micro-advantages, pressure, and protection.' },
    description: {
      pt: 'Mistura ameaças eficientes, respostas leves e proteção pontual para pilotagem precisa e ritmo constante.',
      en: 'Blends efficient threats, light answers, and spot protection for precise piloting and constant pace.'
    },
    strengths: {
      pt: ['Excelente contra combo lento', 'Premia decisões de timing', 'Flexível pós-side'],
      en: ['Excellent into slow combo', 'Rewards timing decisions', 'Flexible post-side']
    },
    weaknesses: {
      pt: ['Margem pequena para erro', 'Menos poder bruto que os tier S'],
      en: ['Small margin for error', 'Less raw power than tier S decks']
    },
    gameplan: {
      pt: 'Pressione cedo, negue o turno-chave do oponente e capitalize em qualquer atraso no desenvolvimento.',
      en: 'Pressure early, deny the opponent’s key turn, and capitalize on any development delay.'
    },
    tags: ['Skill Intensive', 'Flexible', 'Pressure'],
    topMatchups: { pt: ['Combo lento', 'Midrange guloso'], en: ['Slow combo', 'Greedy midrange'] },
    badMatchups: { pt: ['Aggro ultra rápido'], en: ['Ultra-fast aggro'] },
    metaRead: {
      pt: 'Fica melhor quanto mais previsível o field. Excelente escolha para jogadores técnicos.',
      en: 'Gets better the more predictable the field is. Excellent choice for technical players.'
    }
  },
  {
    id: 5,
    name: { pt: 'Cântico de Misericórdia', en: 'Canticle of Mercy' },
    tier: 'A',
    style: 'Midrange',
    virtue: 'Misericórdia',
    shell: { pt: 'Midrange resiliente', en: 'Resilient midrange' },
    image: 'https://picsum.photos/seed/deck-mercy/1200/820',
    power: 84,
    speed: 3,
    matchup: 82,
    pilot: { pt: 'Recursos recorrentes e forte resistência ao atrito.', en: 'Recurring resources and strong resistance to attrition.' },
    description: {
      pt: 'Lista que abusa de restauração, proteção e reaproveitamento para sobreviver ao early e dominar trocas longas.',
      en: 'A list that abuses restoration, protection, and recursion to survive early turns and dominate long trades.'
    },
    strengths: {
      pt: ['Excelente grind game', 'Boa contra decks de remoção', 'Recuperação pós-trade'],
      en: ['Excellent grind game', 'Good into removal decks', 'Strong post-trade recovery']
    },
    weaknesses: {
      pt: ['Menos explosão para punir mulligan ruim', 'Combos inevitáveis são um problema'],
      en: ['Less burst to punish bad mulligans', 'Inevitable combos are a problem']
    },
    gameplan: {
      pt: 'Trave a corrida, sobreviva com trocas eficientes e use valor recorrente para virar a mesa aos poucos.',
      en: 'Lock the race, survive through efficient trades, and use recurring value to slowly turn the table.'
    },
    tags: ['Resilient', 'Recursion', 'Long Game'],
    topMatchups: { pt: ['Midrange de atrito'], en: ['Attrition midrange'] },
    badMatchups: { pt: ['Combo inevitável'], en: ['Inevitable combo'] },
    metaRead: {
      pt: 'Brilha em fields cheios de troca de recurso. Ótimo antídoto para metas grindy.',
      en: 'Shines in fields full of resource trading. A strong antidote to grindy metas.'
    }
  },
  {
    id: 6,
    name: { pt: 'Escada Celestial', en: 'Celestial Ladder' },
    tier: 'A',
    style: 'Combo',
    virtue: 'Sabedoria',
    shell: { pt: 'Combo inevitável', en: 'Inevitable combo' },
    image: 'https://picsum.photos/seed/deck-celestial/1200/820',
    power: 83,
    speed: 4,
    matchup: 78,
    pilot: { pt: 'Explosão tardia com alto teto de poder.', en: 'Late explosive finish with a high power ceiling.' },
    description: {
      pt: 'Arquétipo de setup que compra tempo até encaixar uma sequência inevitável de fechamento.',
      en: 'A setup archetype that buys time until it assembles an inevitable finishing sequence.'
    },
    strengths: {
      pt: ['Maior teto de dano do formato', 'Pune decks lentos', 'Escala muito bem'],
      en: ['Highest damage ceiling in the format', 'Punishes slow decks', 'Scales extremely well']
    },
    weaknesses: {
      pt: ['Sensível a pressão cedo', 'Depende de peças-chave'],
      en: ['Sensitive to early pressure', 'Depends on key pieces']
    },
    gameplan: {
      pt: 'Sobreviva, compre as peças, proteja o turno de setup e encerre em uma janela única de explosão.',
      en: 'Survive, draw the pieces, protect the setup turn, and end the game in a single burst window.'
    },
    tags: ['High Ceiling', 'Setup', 'Explosive'],
    topMatchups: { pt: ['Control lento'], en: ['Slow control'] },
    badMatchups: { pt: ['Aggro', 'Tempo'], en: ['Aggro', 'Tempo'] },
    metaRead: {
      pt: 'Forte quando o meta desacelera. Excelente pocket pick para torneios específicos.',
      en: 'Strong when the meta slows down. Excellent pocket pick for specific tournaments.'
    }
  },
  {
    id: 7,
    name: { pt: 'Guarda do Testamento', en: 'Testament Guard' },
    tier: 'B',
    style: 'Control',
    virtue: 'Misericórdia',
    shell: { pt: 'Control de valor', en: 'Value control' },
    image: 'https://picsum.photos/seed/deck-testament/1200/820',
    power: 76,
    speed: 4,
    matchup: 73,
    pilot: { pt: 'Boa escolha de conforto para campos médios.', en: 'A solid comfort pick for medium-speed fields.' },
    description: {
      pt: 'Deck de respostas sólidas e fechamento estável, mas um pouco abaixo em explosão e eficiência bruta.',
      en: 'A deck with solid answers and a stable close, but slightly behind in explosiveness and raw efficiency.'
    },
    strengths: {
      pt: ['Consistência', 'Boa cobertura geral'],
      en: ['Consistency', 'Good general coverage']
    },
    weaknesses: {
      pt: ['Sem matchup realmente dominante', 'Fecha devagar'],
      en: ['No truly dominant matchup', 'Closes slowly']
    },
    gameplan: {
      pt: 'Troque recursos com disciplina e confie na estabilidade para superar pilotos menos preparados.',
      en: 'Trade resources with discipline and rely on stability to outlast less prepared pilots.'
    },
    tags: ['Comfort Pick', 'Stable', 'Generalist'],
    topMatchups: { pt: ['Rogue linear'], en: ['Linear rogue'] },
    badMatchups: { pt: ['Tier S'], en: ['Tier S decks'] },
    metaRead: {
      pt: 'Ainda viável, mas precisa de ajuste fino ou field favorável para voltar ao topo.',
      en: 'Still viable, but needs tuning or a favorable field to return to the top.'
    }
  },
  {
    id: 8,
    name: { pt: 'Fulgor do Primeiro Dia', en: 'Radiance of the First Day' },
    tier: 'B',
    style: 'Aggro',
    virtue: 'Justiça',
    shell: { pt: 'Aggro vertical', en: 'Vertical aggro' },
    image: 'https://picsum.photos/seed/deck-radiance/1200/820',
    power: 74,
    speed: 1,
    matchup: 70,
    pilot: { pt: 'Boa para punir metas lentos, fraca contra hate preparado.', en: 'Good at punishing slow metas, weak against prepared hate.' },
    description: {
      pt: 'Pressão direta e buffs concentrados para partidas curtas e decisões de corrida.',
      en: 'Direct pressure and concentrated buffs for short games and racing decisions.'
    },
    strengths: {
      pt: ['Começo muito agressivo', 'Bom para subir ladder'],
      en: ['Very aggressive opening', 'Good for ladder climbing']
    },
    weaknesses: {
      pt: ['Pouca resiliência', 'Previsível'],
      en: ['Low resilience', 'Predictable']
    },
    gameplan: {
      pt: 'Maximize dano nos primeiros turnos e force respostas ineficientes antes do jogo longo começar.',
      en: 'Maximize damage in the first turns and force inefficient answers before the late game begins.'
    },
    tags: ['Ladder', 'Direct Damage', 'Fast'],
    topMatchups: { pt: ['Control sem cura'], en: ['Control without healing'] },
    badMatchups: { pt: ['Misericórdia', 'Sweepers'], en: ['Mercy decks', 'Sweepers'] },
    metaRead: {
      pt: 'Opção funcional, porém dependente de surpresa ou de pouca preparação do field.',
      en: 'A functional option, but dependent on surprise or low field preparation.'
    }
  }
];

const state = { lang: 'pt', page: 1, perPage: 6, openDeckId: null };

const els = {
  heroImage: document.querySelector('.decks-hero-media img'),
  header: document.getElementById('siteHeader'),
  mobileToggle: document.getElementById('mobileToggle'),
  primaryNav: document.getElementById('primaryNav'),
  langButtons: document.querySelectorAll('.lang-btn'),
  searchInput: document.getElementById('searchInput'),
  tierFilter: document.getElementById('tierFilter'),
  styleFilter: document.getElementById('styleFilter'),
  virtueFilter: document.getElementById('virtueFilter'),
  sortFilter: document.getElementById('sortFilter'),
  resetFilters: document.getElementById('resetFilters'),
  decksGrid: document.getElementById('decksGrid'),
  resultsCount: document.getElementById('resultsCount'),
  pageIndicator: document.getElementById('pageIndicator'),
  rangeIndicator: document.getElementById('rangeIndicator'),
  prevPage: document.getElementById('prevPage'),
  nextPage: document.getElementById('nextPage'),
  summaryTopDeck: document.getElementById('summaryTopDeck'),
  summaryTopDeckText: document.getElementById('summaryTopDeckText'),
  summaryMetaPace: document.getElementById('summaryMetaPace'),
  summaryMetaPaceText: document.getElementById('summaryMetaPaceText'),
  summaryAntiMeta: document.getElementById('summaryAntiMeta'),
  summaryAntiMetaText: document.getElementById('summaryAntiMetaText'),
  drawer: document.getElementById('deckDrawer'),
  drawerBackdrop: document.getElementById('deckDrawerBackdrop'),
  drawerClose: document.getElementById('drawerClose'),
  drawerContent: document.getElementById('drawerContent'),
  revealElements: () => document.querySelectorAll('.reveal'),
};

function t(pt, en) {
  return state.lang === 'pt' ? pt : en;
}

function localizeDeck(deck) {
  return {
    ...deck,
    name: deck.name[state.lang],
    shell: deck.shell[state.lang],
    pilot: deck.pilot[state.lang],
    description: deck.description[state.lang],
    strengths: deck.strengths[state.lang],
    weaknesses: deck.weaknesses[state.lang],
    gameplan: deck.gameplan[state.lang],
    topMatchups: deck.topMatchups[state.lang],
    badMatchups: deck.badMatchups[state.lang],
    metaRead: deck.metaRead[state.lang],
  };
}

function getFilteredDecks() {
  const query = els.searchInput.value.trim().toLowerCase();
  const tier = els.tierFilter.value;
  const style = els.styleFilter.value;
  const virtue = els.virtueFilter.value;

  const filtered = decksData
    .map(localizeDeck)
    .filter((deck) => {
      const haystack = [deck.name, deck.shell, deck.description, deck.tags.join(' '), deck.style, deck.virtue].join(' ').toLowerCase();
      const matchesQuery = !query || haystack.includes(query);
      const matchesTier = tier === 'all' || deck.tier === tier;
      const matchesStyle = style === 'all' || deck.style === style;
      const matchesVirtue = virtue === 'all' || deck.virtue === virtue;
      return matchesQuery && matchesTier && matchesStyle && matchesVirtue;
    });

  return filtered.sort((a, b) => {
    switch (els.sortFilter.value) {
      case 'matchup-desc': return b.matchup - a.matchup;
      case 'speed-asc': return a.speed - b.speed;
      case 'name-asc': return a.name.localeCompare(b.name);
      case 'power-desc':
      default: return b.power - a.power;
    }
  });
}

function renderSummary() {
  const decks = decksData.map(localizeDeck).sort((a, b) => b.power - a.power);
  const topDeck = decks[0];
  const antiMeta = decks.find((deck) => deck.style === 'Control') || decks[1];

  els.summaryTopDeck.textContent = topDeck.name;
  els.summaryTopDeckText.textContent = topDeck.metaRead;
  els.summaryMetaPace.textContent = t('Midrange / Control', 'Midrange / Control');
  els.summaryMetaPaceText.textContent = t(
    'O field atual recompensa listas que estabilizam o early e convertem valor em pressão limpa do turno 4 em diante.',
    'The current field rewards lists that stabilize the early game and turn value into clean pressure from turn 4 onward.'
  );
  els.summaryAntiMeta.textContent = antiMeta.name;
  els.summaryAntiMetaText.textContent = antiMeta.pilot;
}

function renderDecks() {
  const filtered = getFilteredDecks();
  const totalPages = Math.max(1, Math.ceil(filtered.length / state.perPage));
  if (state.page > totalPages) state.page = totalPages;

  const start = (state.page - 1) * state.perPage;
  const pageItems = filtered.slice(start, start + state.perPage);

  els.decksGrid.innerHTML = pageItems.map((deck) => `
    <article class="deck-card reveal tilt-card">
      <div class="deck-card-media">
        <img src="${deck.image}" alt="${deck.name}" />
        <div class="deck-badges">
          <span class="badge badge-tier">Tier ${deck.tier}</span>
          <span class="badge">${deck.virtue}</span>
        </div>
      </div>
      <div class="deck-card-body">
        <div class="deck-card-head">
          <div>
            <h3>${deck.name}</h3>
            <span class="deck-style">${deck.style} • ${deck.shell}</span>
          </div>
          <div class="power-pill">
            <strong>${deck.power}</strong>
            <span>${t('meta', 'meta')}</span>
          </div>
        </div>

        <p class="deck-description">${deck.description}</p>

        <div class="deck-stats">
          <article class="stat-mini"><span>${t('Curva', 'Curve')}</span><strong>${deck.speed}/5</strong></article>
          <article class="stat-mini"><span>${t('Spread', 'Spread')}</span><strong>${deck.matchup}%</strong></article>
          <article class="stat-mini"><span>${t('Plano', 'Plan')}</span><strong>${deck.style}</strong></article>
        </div>

        <div class="deck-tags">
          ${deck.tags.map((tag) => `<span class="deck-tag">${tag}</span>`).join('')}
        </div>

        <div class="deck-actions">
          <span class="matchup-badge">${t('Favorecido vs', 'Favored vs')} ${deck.topMatchups[0]}</span>
          <button class="btn btn-primary deck-open" type="button" data-deck-id="${deck.id}">${t('Ver detalhes', 'View details')}</button>
        </div>
      </div>
    </article>
  `).join('');

  els.resultsCount.textContent = String(filtered.length);
  els.pageIndicator.textContent = `${state.page} / ${totalPages}`;
  const end = Math.min(start + pageItems.length, filtered.length);
  els.rangeIndicator.textContent = filtered.length
    ? t(`Mostrando ${start + 1}–${end}`, `Showing ${start + 1}–${end}`)
    : t('Nenhum deck encontrado', 'No decks found');

  els.prevPage.disabled = state.page === 1;
  els.nextPage.disabled = state.page === totalPages;

  bindTiltCards();
  bindDrawerButtons();
  handleReveal();
}

function openDrawer(deckId) {
  const deckBase = decksData.find((item) => item.id === Number(deckId));
  if (!deckBase) return;
  const deck = localizeDeck(deckBase);
  state.openDeckId = deck.id;

  els.drawerContent.innerHTML = `
    <div class="drawer-hero">
      <img src="${deck.image}" alt="${deck.name}" />
      <div class="drawer-hero-copy">
        <span class="section-kicker">Tier ${deck.tier} • ${deck.style} • ${deck.virtue}</span>
        <h2>${deck.name}</h2>
        <p>${deck.pilot}</p>
      </div>
    </div>

    <div class="drawer-grid">
      <article class="drawer-stat"><span>${t('Shell', 'Shell')}</span><strong>${deck.shell}</strong></article>
      <article class="drawer-stat"><span>${t('Meta Power', 'Meta Power')}</span><strong>${deck.power}/100</strong></article>
      <article class="drawer-stat"><span>${t('Curva', 'Curve')}</span><strong>${deck.speed}/5</strong></article>
      <article class="drawer-stat"><span>${t('Matchup spread', 'Matchup spread')}</span><strong>${deck.matchup}%</strong></article>
    </div>

    <section class="drawer-section">
      <h3>${t('Plano de jogo', 'Game plan')}</h3>
      <p>${deck.gameplan}</p>
    </section>

    <section class="drawer-section">
      <h3>${t('Qualidades do deck', 'Deck strengths')}</h3>
      <ul class="drawer-list">${deck.strengths.map((item) => `<li>${item}</li>`).join('')}</ul>
    </section>

    <section class="drawer-section">
      <h3>${t('Pontos de atenção', 'Pressure points')}</h3>
      <ul class="drawer-list">${deck.weaknesses.map((item) => `<li>${item}</li>`).join('')}</ul>
    </section>

    <section class="drawer-section">
      <h3>${t('Leitura de meta', 'Meta read')}</h3>
      <p>${deck.metaRead}</p>
    </section>

    <section class="drawer-section">
      <h3>${t('Matchups', 'Matchups')}</h3>
      <ul class="drawer-list">
        <li><strong>${t('Bom contra:', 'Good against:')}</strong> ${deck.topMatchups.join(', ')}</li>
        <li><strong>${t('Sofre contra:', 'Struggles against:')}</strong> ${deck.badMatchups.join(', ')}</li>
      </ul>
    </section>
  `;

  els.drawer.classList.add('is-open');
  els.drawer.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  state.openDeckId = null;
  els.drawer.classList.remove('is-open');
  els.drawer.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function bindDrawerButtons() {
  document.querySelectorAll('.deck-open').forEach((button) => {
    button.addEventListener('click', () => openDrawer(button.dataset.deckId));
  });
}

function bindTiltCards() {
  document.querySelectorAll('.tilt-card').forEach((card) => {
    if (card.dataset.tiltBound === 'true') return;
    card.dataset.tiltBound = 'true';
    card.addEventListener('mousemove', (event) => {
      if (window.innerWidth < 900) return;
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 10;
      const rotateX = ((y / rect.height) - 0.5) * -10;
      card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

function applyLanguage(lang) {
  state.lang = lang;
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
  document.querySelectorAll('[data-pt]').forEach((node) => {
    node.innerHTML = node.dataset[lang];
  });
  els.searchInput.placeholder = t('Buscar deck, shell ou palavra-chave', 'Search deck, shell, or keyword');
  els.langButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.lang === lang));
  renderSummary();
  renderDecks();
  if (state.openDeckId) openDrawer(state.openDeckId);
}

function handleHeader() {
  if (window.scrollY > 20) els.header.classList.add('is-scrolled');
  else els.header.classList.remove('is-scrolled');
}

function handleReveal() {
  const trigger = window.innerHeight * 0.88;
  els.revealElements().forEach((element) => {
    const top = element.getBoundingClientRect().top;
    if (top < trigger) element.classList.add('is-visible');
  });
}

function handleParallax() {
  if (!els.heroImage) return;
  const offset = window.scrollY * 0.12;
  els.heroImage.style.transform = `scale(1.05) translateY(${offset}px)`;
}

els.mobileToggle?.addEventListener('click', () => {
  const isOpen = els.primaryNav.classList.toggle('is-open');
  els.mobileToggle.setAttribute('aria-expanded', String(isOpen));
});

els.primaryNav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    els.primaryNav.classList.remove('is-open');
    els.mobileToggle?.setAttribute('aria-expanded', 'false');
  });
});

els.langButtons.forEach((button) => button.addEventListener('click', () => applyLanguage(button.dataset.lang)));
[els.searchInput, els.tierFilter, els.styleFilter, els.virtueFilter, els.sortFilter].forEach((input) => {
  input.addEventListener('input', () => {
    state.page = 1;
    renderDecks();
  });
  input.addEventListener('change', () => {
    state.page = 1;
    renderDecks();
  });
});

els.resetFilters.addEventListener('click', () => {
  els.searchInput.value = '';
  els.tierFilter.value = 'all';
  els.styleFilter.value = 'all';
  els.virtueFilter.value = 'all';
  els.sortFilter.value = 'power-desc';
  state.page = 1;
  renderDecks();
});

els.prevPage.addEventListener('click', () => {
  if (state.page > 1) {
    state.page -= 1;
    renderDecks();
    window.scrollTo({ top: document.getElementById('archetypes').offsetTop - 90, behavior: 'smooth' });
  }
});

els.nextPage.addEventListener('click', () => {
  const totalPages = Math.max(1, Math.ceil(getFilteredDecks().length / state.perPage));
  if (state.page < totalPages) {
    state.page += 1;
    renderDecks();
    window.scrollTo({ top: document.getElementById('archetypes').offsetTop - 90, behavior: 'smooth' });
  }
});

els.drawerBackdrop.addEventListener('click', closeDrawer);
els.drawerClose.addEventListener('click', closeDrawer);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && els.drawer.classList.contains('is-open')) closeDrawer();
});

window.addEventListener('scroll', () => {
  handleHeader();
  handleReveal();
  handleParallax();
});

window.addEventListener('load', () => {
  handleHeader();
  handleReveal();
  handleParallax();
  renderSummary();
  renderDecks();
  applyLanguage(state.lang);
});
