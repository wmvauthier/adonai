# Design das páginas migradas

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
