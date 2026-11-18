# Design das páginas migradas

## Cartas horizontais e intercâmbio de decks

`shared/card-orientation.js` identifica Templos e Territórios pelo catálogo e pelos
tipos `TEM`/`TER`. Quando a imagem completa está vertical, produz uma versão
horizontal em memória (90° no sentido horário) para os elementos `img`, incluindo
prévias e conteúdo inserido dinamicamente. Não modifica arquivos, artes isoladas
nem imagens que já estejam horizontais. A versão é reutilizada durante a visita.

`shared/deck-text.js` implementa o TXT do TCGArena: `quantidade Nome`, com identidade,
14 virtudes/desvirtudes, baralho e `Sideboard:` vazio. Os nomes exportados são os
nomes oficiais em português do catálogo, preservando maiúsculas e acentos.
Na importação, virtudes são ignoradas e a reserva é informada como não suportada.
IDs no formato antigo também são aceitos. Nomes ambíguos, cartas desconhecidas,
cópias extras e decks acima dos limites são recusados sem substituir o deck atual.
Não é possível resolver automaticamente duas cartas com o mesmo nome quando o
texto não contém nenhuma distinção; nesses casos, use os IDs antigos.

Testes: `node --test scripts/deck-text.test.mjs`.

`index.html` é a home oficial. A página de partida está em `play/index.html`.

Home e Como Jogar usam:
- `shared/site.css`: componentes e tema Dark.
- `shared/site-light.css`: direção original do Light (papel, azul profundo e vermelho queimado).
- `shared/theme.js`: seleção sol/lua e LocalStorage `adonai-theme`, com Dark padrão.
- `shared/site.js`: menu móvel, navegação por teclado e idioma.
- `shared/card-content.js`: imagens a partir de coleção/número e catálogo central; o atributo `data-content` do script aponta para a seleção de cada página.

Seleções: `index/home-content.json` e `how-to-play/card-content.json`. Caminhos e nomes das cartas continuam em `data/game/cards.json`.

Reviews: `data/content/reviews.json`. Tutoriais: `how-to-play/how-to-play-content.json`. Itens de exemplo estão com `enabled: false`; substitua-os por conteúdo real e habilite-os para publicar. Sem itens habilitados, a página exibe “Tutoriais em vídeo em breve”.

Home, Como Jogar, Cartas, Decks, Deckbuilder, Manual, Galeria e Lore usam a identidade compartilhada. A página Play mantém os estilos específicos da arena e sua camada de apresentação em `play/css/arena-presentation.css`.
