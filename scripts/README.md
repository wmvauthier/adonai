# Atualização das métricas de cartas

Requer Node.js 18 ou mais recente, sem dependências externas. Execute após adicionar,
alterar ou remover decks em `data/game/decks.json`:

```sh
node scripts/update-card-usage.mjs --dry-run
node scripts/update-card-usage.mjs
```

Os caminhos são resolvidos a partir do script, independentemente da pasta de execução.
O arquivo atualizado é `data/game/cards.json`. Publique esse JSON atualizado junto
do site para refletir as métricas no catálogo. O script não executa no navegador
nem acompanha automaticamente decks que existam apenas no LocalStorage.

## Cálculo

- Universo: todos os decks cadastrados em `decks.json`.
- `usage.deckCount`: quantidade de decks que contêm a carta em `cards` ou na identidade
  (`champions`, `temples`, `territories`). Repetições dentro do mesmo deck contam uma vez.
- `usage.inclusion`: `deckCount / total de decks × 100`, com duas casas decimais.
- `rating`: `deckCount / total de decks × 5`, com duas casas decimais, compatível com
  a escala 0–5 e a ordenação “Melhor avaliadas” já existentes em Cartas.
- `usage.archetypes`: união dos nomes no campo opcional `archetypes` de cada deck
  que contém a carta. Não infere estratégias a partir do nome ou da análise do deck.
  Sem arquétipos explícitos, a lista fica vazia.

A nota mede popularidade no conjunto cadastrado, não força, avaliação de usuários ou
taxa de vitória. Uma carta presente em 3 de 6 decks tem inclusão 50% e nota 2,5.
Identidades e cartas do baralho usam o mesmo denominador; portanto, os números
representam presença no catálogo de decks, não preferência dentro de cada tipo.

Referências inexistentes, identidades malformadas e IDs duplicados interrompem a
execução antes da gravação. Cartas não usadas recebem zero; uma base vazia zera todas
as métricas. Os demais campos das cartas são preservados. A gravação é atômica e a
data `updatedAt` só muda quando existem alterações nas métricas.

Verificação:

```sh
node --test scripts/update-card-usage.test.mjs
python3 scripts/validate_project.py
```

## Gerar o PDF das regras

Com Node.js, FFmpeg e Chromium instalados, execute `node scripts/build-rules-pdf.mjs`.
A variável `CHROMIUM` permite indicar o executável do navegador. Para usar a
impressão via Playwright, disponibilize `playwright-core` ao Node e acrescente
`--playwright` ao comando.

O gerador combina `data/rules/comprehensive_rules.md` com exemplos vinculados aos
números das subseções e grava `manual/regras-adonai.pdf`. Edite as situações em
`scripts/rules-examples.mjs`. As quatro demonstrações com passos e as fichas
ilustradas estão em `scripts/build-rules-pdf.mjs`. As imagens são redimensionadas
em uma pasta temporária durante a geração.
