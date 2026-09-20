// Presentation selects collection/number pairs; the catalog owns names and images.
(() => {
  const script = document.currentScript;
  const siteRoot = new URL("../", script.src);
  const configUrl = new URL(script.dataset.content, document.baseURI);
  const status = document.getElementById("cardDataStatus");
  const fail = (error) => {
    if (status) status.hidden = false;
    console.warn("Conteúdo de cartas:", error);
  };
  const key = (collection, number) =>
    `${collection}:${String(number).padStart(3, "0")}`;
  const read = async (path) => {
    const response = await fetch(new URL(path, siteRoot));
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return response.json();
  };
  // Catalog paths follow the same convention as the /cards/ page (../assets/…).
  const mediaUrl = (path) => {
    if (typeof path !== "string" || !path.trim()) return "";
    const url = new URL(path, new URL("cards/", siteRoot));
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  };
  let bindings = [];
  const localize = () => {
    const lang = document.documentElement.lang === "en" ? "en" : "pt";
    const text = (value) =>
      typeof value === "string"
        ? value
        : value?.[lang] || value?.pt || value?.en || "";
    bindings.forEach(({ element, card, typeNames }) => {
      if (element.hasAttribute("data-card-name"))
        element.textContent = text(card.name);
      if (element.hasAttribute("data-card-type"))
        element.textContent = typeNames.map(text).join(" / ");
      if (element.hasAttribute("data-card-image")) {
        const decorative = element.classList.contains("identity-background");
        element.alt = decorative
          ? ""
          : (element.dataset.cardImage === "art"
              ? lang === "pt"
                ? "Arte de "
                : "Artwork for "
              : "") + text(card.name);
      }
    });
  };
  document.addEventListener("home:language", localize);
  Promise.all([
    read(configUrl),
    read("data/game/cards.json"),
    read("data/refs/types.json").catch((error) => {
      fail(error);
      return { types: [] };
    }),
    read("data/refs/collections.json").catch((error) => {
      fail(error);
      return { collections: [] };
    }),
  ])
    .then(([config, catalog, types, collections]) => {
      const cards = new Map(
        catalog.cards.map((card) => [key(card.collection, card.number), card]),
      );
      const typeMap = new Map(types.types.map((type) => [type.id, type.name]));
      const collectionMap = new Map(
        collections.collections.map((collection) => [
          collection.id,
          collection.code,
        ]),
      );
      document.querySelectorAll("[data-card-slot]").forEach((element) => {
        try {
          const reference = config.slots[element.dataset.cardSlot];
          const card =
            reference && cards.get(key(reference.collection, reference.number));
          if (!card)
            throw new Error(
              `Carta não encontrada: ${element.dataset.cardSlot}`,
            );
          bindings.push({
            element,
            card,
            typeNames: (card.type || [])
              .map((id) => typeMap.get(id))
              .filter(Boolean),
          });
          if (element.hasAttribute("data-card-image")) {
            const url = mediaUrl(card.images?.[element.dataset.cardImage]);
            if (!url)
              throw new Error(
                `Imagem não encontrada: ${element.dataset.cardSlot}`,
              );
            element.addEventListener(
              "error",
              () => {
                element.hidden = true;
                fail(`Falha ao carregar imagem: ${element.dataset.cardSlot}`);
              },
              { once: true },
            );
            element.src = url;
            element.hidden = false;
          }
          if (element.hasAttribute("data-card-link")) {
            const url = new URL("cards/", siteRoot);
            url.searchParams.set("set", card.collection);
            url.searchParams.set("cn", card.number);
            element.href = url.href;
          }
          if (element.hasAttribute("data-card-number")) {
            element.textContent = `${collectionMap.get(card.collection) || card.collection} / ${card.number}`;
          }
        } catch (error) {
          fail(error);
        }
      });
      localize();
    })
    .catch(fail);
})();
