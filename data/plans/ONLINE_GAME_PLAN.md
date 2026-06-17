# Adonai Play - Local First To Online Plan

Status: planejamento inicial
Ultima revisao: 2026-06-06

Este documento organiza o plano para transformar o Adonai em uma experiencia jogavel estilo TCG Arena / MTG Arena, integrada ao site atual, com foco mobile first, baixo custo inicial e evolucao por entregas pequenas.

Direcao atual:

- Primeiro construir uma versao local completa em `/play/`.
- O usuario deve chegar em `/play/` a partir do deckbuilder ou de um deck pre-construido em `decks.html`.
- A primeira experiencia jogavel sera humano contra bot.
- Mulligan, reducao, pilha, prioridade, combate e demais regras do jogo devem ser validados localmente antes da camada online.
- WebSocket, usuarios, banco de dados, ranking, pontos, matchmaking, salvar decks em nuvem e demais funcoes sociais ficam para depois.

## 1. Decisoes Ja Tomadas

- [x] O app online deve ficar no mesmo dominio, preferencialmente em `/play/`.
- [x] O site atual continua funcionando como site publico estatico.
- [x] O jogo online pode ter backend separado para API/WebSocket no futuro.
- [x] A preferencia inicial e manter frontend em HTML/CSS/JS puro.
- [x] React/Next podem ser usados se JS puro ficar improdutivo para a UI ou estado do tabuleiro.
- [x] MVP inicial sera local, humano contra bot.
- [x] O primeiro ciclo nao tera PvP online.
- [x] O primeiro ciclo nao tera sala privada por convite.
- [x] Quick match fica para depois da versao local completa.
- [x] Ranking, pontos e temporadas ficam para depois da versao local completa.
- [x] Timer anti-slow-play fica para depois da versao local completa, quando houver jogo online.
- [x] Chat fica para depois da versao local completa.
- [x] Banco de dados, usuarios e Auth ficam para depois da versao local completa.
- [x] Salvar decks em nuvem fica para depois da versao local completa.
- [x] MVP inicial pode usar decks pre-construidos e decks vindos do deckbuilder via estado local/export.
- [x] Antes da rede, devemos construir uma versao local completa contra bot.
- [x] A camada WebSocket deve entrar depois que engine, UI, cartas, deck, regras, animacoes e sons estiverem 100% validados localmente.
- [x] O motor de jogo deve ser independente de rede para poder rodar localmente, contra bot e depois no servidor.
- [x] Deckbuilder publico continua sem login.
- [x] Usuario logado podera salvar e recuperar decks no futuro.
- [x] Decks oficiais devem estar sempre disponiveis.
- [x] Decks de usuario devem passar validacao server-side antes de jogo online.
- [x] Ranking futuro deve ser sempre ranqueado.
- [x] Temporadas existirao, mas a organizacao define quando cada temporada encerra.
- [x] Ranking global visivel e desejado.
- [x] Derrota por desconexao conta como derrota se o jogador nao reconectar a tempo.
- [x] Empate deve ser possivel, embora raro pelas regras.
- [x] Login local com usuario/senha basta para o inicio.
- [x] Nome publico unico obrigatorio.
- [x] Perfil publico, historico, avatar e titulos sao desejados.
- [x] Partida em melhor de 1 no inicio.
- [x] Jogador pode conceder.
- [x] Se cair, o jogador deve tentar reconectar enquanto a partida existir.
- [x] Timer futuro deve seguir sensacao de corda do MTG Arena.

## 2. Estado Atual Da Base

- [x] `data/rules/comprehensive_rules.md` existe e esta maduro o suficiente para orientar um motor de regras.
- [x] `data/game/cards.json` possui 52 cartas atualmente.
- [x] Das 52 cartas, 40 sao elegiveis para deck principal.
- [x] Das 52 cartas, 12 sao cartas de Identidade:
  - 4 Campeoes;
  - 4 Territorios;
  - 4 Templos.
- [x] `data/game/decks.json` possui decks pre-construidos.
- [x] `data/game/decks.json` usa o campo `cards`, nao `main`.
- [x] Cada deck pre-construido atual tem 40 cartas em `cards`.

## 3. Ponto Critico Sobre Custo Zero

Objetivo declarado: iniciar com R$0 sempre que possivel.

Avaliacao critica:

- [x] R$0 e viavel para prototipo local, engine local, UI mobile first e pagina `/play/` estatica.
- [x] R$0 pode ser viavel para banco/auth em camada free, dependendo de limites.
- [ ] R$0 nao e uma boa promessa para PvP realtime confiavel e sempre disponivel.
- [ ] Servidor WebSocket autoritativo normalmente precisa de processo sempre ligado.
- [ ] Servicos free podem dormir, reiniciar, ter cold start ou limite mensal.

Conclusao:

Para validar estetica, estrutura, engine e fluxo de partida: R$0 e adequado.

Para beta online PvP minimamente confiavel: provavelmente sera necessario aceitar custo pequeno, algo como US$ 2 a US$ 10/mes no servidor realtime, ou US$ 5/mes em plataforma com creditos minimos. Se usar Supabase Pro no futuro, passa para US$ 25/mes ou mais.

Referencias de precos consultadas:

- Supabase Pricing: https://supabase.com/pricing
- Fly.io Pricing: https://fly.io/docs/about/pricing/
- Render Free: https://render.com/docs/free
- Railway Pricing: https://railway.com/pricing

Observacoes de infra:

- Fly.io cobra por uso e exige cartao. Maquinas pequenas `shared-cpu-1x` aparecem na faixa de poucos dolares por mes conforme regiao e memoria.
- Render Free oferece horas gratuitas, mas servicos free podem suspender/dormir, o que e ruim para WebSocket de partida ao vivo.
- Railway tem plano Hobby com minimo de US$ 5 e creditos inclusos.
- Supabase Free pode ajudar no inicio para Auth/Postgres, mas a parte autoritativa de partida nao deve depender apenas de triggers/realtime de banco.

## 4. Estrategia Recomendada

Recomendacao geral:

1. Construir primeiro o motor local de partida.
2. Construir uma UI `/play/` mobile first em JS puro.
3. Integrar entrada por deck pre-construido em `decks.html`.
4. Integrar entrada por deck montado no deckbuilder, usando estado local/export sem login.
5. Criar um bot local para permitir partidas completas sem outro jogador.
6. Programar cartas e efeitos localmente, com status claro por carta.
7. Implementar as regras centrais: mulligan, reducao, pilha, prioridade, combate, habilidades, alvos e acoes baseadas no estado.
8. Validar design, animacoes, sons, carregamento de deck e fluxo completo contra o bot.
9. Fazer sessoes de teste locais ate o jogo estar divertido, legivel e consistente.
10. Somente depois criar um adaptador de rede/WebSocket usando o mesmo motor.
11. Depois disso adicionar sala privada online, Auth, banco, decks salvos, ranking, pontos, temporadas e matchmaking.

Justificativa:

- O maior risco nao e hospedagem.
- O maior risco e modelar regras, estado de partida, acoes legais, mulligan, reducao, pilha, prioridade, combate, efeitos de cartas, UX mobile e clareza visual.
- Resolver isso localmente reduz custo, acelera teste e evita confundir bug de regra com bug de rede.
- Jogar contra bot permite repetir cenarios, testar cartas, validar feedback visual e ajustar ritmo sem depender de outra pessoa online.
- Depois que o motor estiver estavel, plugar rede fica mais controlado porque WebSocket passa a transportar acoes e snapshots, nao a definir regra.

Regra de corte:

- Enquanto a partida local contra bot nao estiver completa e validada, nao investir em social/backend.
- "Completa" significa: deck real carrega, mulligan funciona, reducao funciona, pilha e prioridade funcionam, combate funciona, efeitos principais das cartas funcionam e uma partida termina corretamente.
- Ranking, pontos, matchmaking, usuarios, banco, WebSocket e decks salvos em nuvem so entram depois desse marco.

Principio tecnico:

- O cliente local, o bot e o servidor online devem usar a mesma estrutura de `GameState`, `GameAction` e regras.
- O online nao deve exigir reescrever as cartas.
- O WebSocket deve ser um adaptador de transporte.
- A autoridade final no online sera do servidor, mas a logica nasce local e testavel.

## 5. Arquitetura Alvo

### 5.1. Frontend Publico

Local atual:

- `/`
- `/cards/`
- `/decks/`
- `/deckbuilder/`
- `/manual/`
- `/gallery/`
- `/lore/`
- `/how-to-play/`

Tecnologia atual:

- HTML;
- CSS;
- JS puro;
- JSON local.

Decisao:

- [x] Manter como esta.
- [ ] Adicionar link futuro para `/play/`.

### 5.2. Frontend Do Jogo

Local planejado:

- `/play/`

Tecnologia inicial:

- HTML/CSS/JS puro.

Possivel migracao futura:

- Vite + React, se o estado do tabuleiro ficar complexo demais.
- Next.js somente se precisarmos de rotas/app full-stack no frontend, o que nao parece necessario no inicio.

Responsabilidades:

- iniciar partida local;
- iniciar partida contra bot;
- renderizar preparacao local;
- renderizar selecao de deck pre-construido;
- receber deck vindo do deckbuilder;
- renderizar tabuleiro;
- renderizar mao;
- renderizar campo;
- renderizar identidade;
- renderizar pilha simplificada no primeiro prototipo;
- renderizar pilha completa na Local 1.0;
- renderizar log;
- tocar efeitos sonoros;
- executar animacoes de jogo;
- carregar decks oficiais;
- carregar decks locais do usuario via deckbuilder/export;
- enviar acoes do jogador ao engine local.

Responsabilidades futuras:

- renderizar sala privada;
- enviar acoes ao servidor;
- receber snapshots/eventos remotos;
- lidar com reconexao.

### 5.3. Backend Autoritativo

Status:

- Futuro.
- Nao implementar antes da Validacao Local 1.0 e do Gate Para Online/Pago.

Tecnologia sugerida:

- Node.js;
- Fastify ou servidor HTTP simples;
- WebSocket com `ws`;
- TypeScript quando o projeto sair do prototipo.

Responsabilidades:

- Criar sala;
- entrar em sala;
- iniciar partida;
- validar deck;
- manter `GameState`;
- receber `GameAction`;
- validar se a acao e legal;
- aplicar acao;
- emitir eventos/snapshots;
- salvar resultado;
- aplicar ranking no futuro.

### 5.4. Banco E Auth

Status:

- Fora da fase local.
- So deve ser escolhido depois da Validacao Local 1.0.

Opcao recomendada futura:

- Supabase Free para Auth + Postgres, se os limites forem suficientes.

Alternativa:

- SQLite/Postgres local somente quando comecar prototipo de backend.
- Neon Free para Postgres, se preferirmos separar auth.

Decisao futura:

- [ ] Confirmar se vamos usar Supabase Auth.
- [ ] Confirmar se login local via usuario/senha sera implementado por Supabase ou por backend proprio.

Recomendacao critica:

Use Supabase Auth se quiser rapidez e menos risco de seguranca quando chegarmos na etapa online. Login proprio parece simples, mas aumenta responsabilidade com senha, reset, hash, rate limit, bloqueios e recuperacao de conta.

## 6. Fases De Entrega

### Fase 0 - Preparacao Do Projeto

- [ ] Criar pasta `/play/`.
- [ ] Criar `play/index.html`.
- [ ] Criar `play/play.css`.
- [ ] Criar `play/play.js`.
- [ ] Criar `play/engine/`.
- [ ] Criar `play/engine/game-state.js`.
- [ ] Criar `play/engine/actions.js`.
- [ ] Criar `play/engine/rules.js`.
- [ ] Criar `play/engine/card-catalog.js`.
- [ ] Carregar `data/game/cards.json`.
- [ ] Carregar `data/game/decks.json`.
- [ ] Criar tela placeholder mobile first do tabuleiro.
- [ ] Criar simulador local de partida.

Critério de aceite:

- `/play/` abre no navegador.
- UI inicial mostra dois jogadores, identidades, mao, campo, deck, cemiterio e log.
- Um deck oficial pode ser carregado localmente.
- Nenhum backend necessario.

### Fase 1 - GameState Local

- [ ] Definir `GameState`.
- [ ] Definir `PlayerState`.
- [ ] Definir zonas:
  - deck;
  - hand;
  - battlefield;
  - essence;
  - cemetery;
  - exile;
  - reserve;
  - identity;
  - stack.
- [ ] Definir `TurnState`.
- [ ] Definir `PriorityState` simplificado.
- [ ] Definir `CombatState` simplificado.
- [ ] Definir `LogEntry`.
- [ ] Criar seed deterministico para embaralhamento em dev.
- [ ] Criar setup de partida 1v1 com decks oficiais.
- [ ] Comprar mao inicial automaticamente.

Critério de aceite:

- Partida local cria dois jogadores.
- Cada jogador tem deck, mao e identidade.
- Estado aparece na UI.
- Log inicial registra setup.

### Fase 2 - Acoes Basicas Locais

- [ ] Passar turno.
- [ ] Avancar etapa.
- [ ] Comprar carta.
- [ ] Consagrar carta de mao para Essencia.
- [ ] Jogar Personagem de forma simplificada.
- [ ] Jogar Artefato de forma simplificada.
- [ ] Jogar Milagre de forma simplificada.
- [ ] Jogar Pecado de forma simplificada.
- [ ] Pagar custo com Essencia.
- [ ] Pagar Pecado causando dano ao proprio Territorio.
- [ ] Conceder partida.
- [ ] Detectar derrota por dano no Territorio.

Escopo simplificado:

- Sem mulligan.
- Sem reducao 40 para 30-40.
- Sem pilha completa.
- Sem prioridade completa.
- Sem busca.
- Sem efeitos complexos.

Critério de aceite:

- Jogador consegue jogar cartas basicas localmente.
- Dano no Territorio pode encerrar partida.
- Concessao encerra partida.

### Fase 3 - UI Mobile First Do Tabuleiro

- [ ] Layout vertical para celular.
- [ ] Area do oponente compacta no topo.
- [ ] Area central para campo/pilha/log resumido.
- [ ] Area do jogador no rodape.
- [ ] Mao em carrossel horizontal.
- [ ] Identidade sempre acessivel.
- [ ] Botao de acao contextual.
- [ ] Painel de carta ampliada ao tocar/segurar.
- [ ] Estados visuais:
  - carta jogavel;
  - carta sem custo;
  - alvo valido;
  - alvo invalido;
  - carta selecionada;
  - aguardando oponente;
  - turno proprio;
  - turno do oponente.

Critério de aceite:

- A partida local pode ser jogada em tela mobile.
- Cartas e zonas sao legiveis.
- Fluxo visual lembra Arena sem copiar interface.

### Fase 4 - Bot Local De Treino

- [ ] Criar `BotPlayer`.
- [ ] Criar decisao basica para comprar/passos automaticos.
- [ ] Criar decisao basica para consagrar cartas.
- [ ] Criar decisao basica para jogar carta quando houver custo.
- [ ] Criar decisao basica para atacar.
- [ ] Criar decisao basica para escolher alvo simples.
- [ ] Permitir escolher dificuldade `teste`, `basico` e `agressivo`.
- [ ] Registrar no log quando uma acao foi feita pelo bot.
- [ ] Garantir que o bot use `GameAction`, nao acesso direto ao estado.

Critério de aceite:

- Jogador humano consegue iniciar partida contra bot.
- Bot joga turnos completos sem travar.
- Bot permite testar fluxo, layout e cartas basicas sem rede.

### Fase 5 - Cartas E Efeitos Locais

- [ ] Criar `data/engine/abilities.json` e `data/engine/effect_actions.json`.
- [ ] Mapear as 52 cartas com status:
  - `not_implemented`;
  - `stub`;
  - `basic`;
  - `complete`;
  - `needs_ruling`.
- [ ] Implementar primeiro as cartas essenciais para uma partida local jogavel.
- [ ] Implementar cartas de Identidade em modo basico.
- [ ] Implementar Personagens em modo basico.
- [ ] Implementar Artefatos em modo basico.
- [ ] Implementar Milagres em modo basico.
- [ ] Implementar Pecados em modo basico.
- [ ] Bloquear, simplificar ou marcar visualmente cartas ainda incompletas.
- [ ] Criar painel/debug para ver status de implementacao de cartas.

Critério de aceite:

- Todas as 52 cartas aparecem no catalogo de efeitos.
- Nenhuma carta entra no jogo sem status conhecido.
- Partidas contra bot usam cartas reais da base, ainda que algumas estejam em modo simplificado.

### Fase 6 - Decks E Preparacao Local

- [ ] Listar decks oficiais de `data/game/decks.json`.
- [ ] Validar identidade do deck.
- [ ] Validar 40 cartas do deck.
- [ ] Validar singleton.
- [ ] Validar se cartas existem no catalogo.
- [ ] Permitir escolher deck oficial antes da partida local.
- [ ] Permitir escolher deck do bot.
- [ ] Permitir abrir `/play/` a partir de um deck pre-construido em `decks.html`.
- [ ] Permitir abrir `/play/` a partir de um deck montado no deckbuilder.
- [ ] Definir formato local de transferencia de deck:
  - `localStorage`;
  - query string curta com id de deck pre-construido;
  - ou import/export de texto para decks customizados.
- [ ] Validar no `/play/` o deck recebido do deckbuilder.
- [ ] Se o deck recebido for invalido, mostrar motivo e voltar para deckbuilder/decks.
- [ ] Criar tela de preparacao de partida.
- [ ] Mostrar resumo de virtudes, curva, tipos e identidade antes de iniciar.

Critério de aceite:

- Usuario escolhe um deck oficial e joga contra bot.
- Usuario monta um deck no deckbuilder e joga contra bot.
- Bot tambem usa um deck oficial validado.
- Preparacao local antecipa a mesma estrutura que sera usada no online, mas sem banco/login.

### Fase 7 - Design, Animacoes E Sons

- [ ] Refinar HUD mobile first.
- [ ] Criar estado de carta ampliada.
- [ ] Criar animacao de compra.
- [ ] Criar animacao de jogar carta.
- [ ] Criar animacao de ataque/dano.
- [ ] Criar animacao de descarte/cemiterio.
- [ ] Criar feedback visual de alvo valido/invalido.
- [ ] Criar feedback visual de custo pagavel/nao pagavel.
- [ ] Criar efeitos sonoros basicos:
  - compra;
  - jogar carta;
  - ataque;
  - dano;
  - vitoria;
  - derrota;
  - erro/acao invalida.
- [ ] Criar controle de volume/mudo.
- [ ] Garantir que animacoes nao bloqueiem a engine.

Critério de aceite:

- Partida local contra bot comunica claramente o que esta acontecendo.
- Mobile e desktop ficam legiveis.
- Sons podem ser desativados.
- O jogo passa a parecer um produto jogavel, nao apenas um simulador tecnico.

### Fase 8 - Testes Locais Do MVP Basico

- [ ] Criar modo debug para resetar partida.
- [ ] Criar seed deterministico para repetir cenarios.
- [ ] Criar log exportavel de partida local.
- [ ] Criar checks automatizados simples de estado.
- [ ] Testar todos os decks oficiais contra bot.
- [ ] Testar cartas essenciais em modo `basic` ou `stub`.
- [ ] Ajustar tamanho de cartas e zonas em mobile.
- [ ] Ajustar ritmo das animacoes.
- [ ] Ajustar clareza dos prompts de acao.

Critério de aceite:

- Uma partida local basica pode ser jogada contra bot sem erro critico.
- Cartas essenciais e decks oficiais tem comportamento conhecido.
- O fluxo ja esta bom o suficiente para convidar outra pessoa a testar presencialmente no mesmo computador/celular.

### Fase 9 - Regras Completas Locais

- [ ] Mulligan.
- [ ] Reducao pre-jogo de 40 para 30-40.
- [ ] Pilha completa.
- [ ] Prioridade completa.
- [ ] Passagem de prioridade.
- [ ] Resposta a acoes e efeitos.
- [ ] Habilidades ativadas.
- [ ] Habilidades desencadeadas.
- [ ] Alvos simples e multiplos.
- [ ] Validacao de alvos.
- [ ] Busca no baralho.
- [ ] Busca na Reserva.
- [ ] Embaralhamento depois de busca.
- [ ] Efeitos continuos ate o Reagrupamento.
- [ ] Combate completo.
- [ ] Declaracao de atacantes.
- [ ] Declaracao de bloqueadores.
- [ ] Bloqueadores multiplos, se confirmado pelas regras.
- [ ] Dano de combate.
- [ ] Equipamentos completos.
- [ ] Fichas.
- [ ] Ordem de aplicacao de modificadores.
- [ ] Acoes baseadas no estado completas.
- [ ] Condicoes de vitoria/derrota/empate.
- [ ] Concessao.

Critério de aceite:

- Engine suporta as regras do `data/rules/comprehensive_rules.md` com boa fidelidade.
- Uma partida local contra bot usa as regras reais, nao apenas regras simplificadas.
- O fluxo de prioridade e pilha fica compreensivel em mobile.

### Fase 10 - Cartas Completas Locais

- [ ] Revisar texto de todas as 52 cartas.
- [ ] Confirmar se cada carta tem ruling suficiente para engine.
- [ ] Completar `card_effects`.
- [ ] Remover `stub` das cartas que entram no modo local 1.0.
- [ ] Marcar explicitamente cartas que exigem decisao de regra.
- [ ] Garantir que bot consegue lidar com cada carta implementada.
- [ ] Criar cenarios de teste manuais por carta.
- [ ] Criar checklist de regressao por deck.

Critério de aceite:

- Todas as cartas usadas em decks oficiais estao em `complete` ou em `needs_ruling` justificado.
- Nenhuma carta tem comportamento invisivel ou improvisado sem registro.
- O modo local 1.0 pode ser demonstrado como jogo real contra bot.

### Fase 11 - Validacao Local 1.0

- [ ] Jogar partidas completas com cada deck oficial.
- [ ] Jogar partidas completas com deck vindo do deckbuilder.
- [ ] Testar mulligan.
- [ ] Testar reducao.
- [ ] Testar pilha.
- [ ] Testar prioridade.
- [ ] Testar combate.
- [ ] Testar busca.
- [ ] Testar efeitos continuos.
- [ ] Testar vitoria.
- [ ] Testar derrota.
- [ ] Testar concessao.
- [ ] Testar som ligado/desligado.
- [ ] Testar mobile.
- [ ] Testar desktop.
- [ ] Registrar bugs conhecidos.
- [ ] Corrigir bugs bloqueantes antes de iniciar rede.

Critério de aceite:

- O usuario consegue sair de `decks.html` ou deckbuilder, entrar em `/play/` e jogar uma partida completa contra bot.
- O jogo local esta estavel o suficiente para servir de base ao servidor.
- A fase paga/online so deve comecar depois deste aceite.

### Fase 12 - Gate Para Online/Pago

- [ ] Revisar custo real esperado.
- [ ] Escolher provedor de servidor realtime.
- [ ] Escolher banco/Auth.
- [ ] Definir se o frontend continua em GitHub Pages.
- [ ] Definir se `/play/` local continua estatico.
- [ ] Definir plano de deploy.
- [ ] Definir ambiente de teste online privado.
- [ ] Confirmar se o momento justifica custo mensal.

Critério de aceite:

- Decisao consciente de iniciar a etapa paga/online.
- O custo mensal estimado esta aceito.
- Existe um plano claro de deploy e rollback.

### Fase 13 - Adaptador De Rede E WebSocket Local

- [ ] Criar `server/`.
- [ ] Criar servidor Node.js.
- [ ] Criar WebSocket.
- [ ] Criar `NetworkAdapter`.
- [ ] Separar `LocalGameController` e `RemoteGameController`.
- [ ] Enviar `GameAction` do cliente para o servidor.
- [ ] Servidor valida e aplica acoes usando o mesmo motor.
- [ ] Servidor envia eventos/snapshots para os clientes.
- [ ] Cliente renderiza snapshots remotos.
- [ ] Garantir que o cliente online nao altere estado autoritativo diretamente.

Critério de aceite:

- A mesma partida que funciona localmente tambem roda em dois navegadores locais via WebSocket.
- O servidor e a fonte da verdade.
- Nao ha duplicacao de regra entre local e online.

### Fase 14 - Sala Privada Online

- [ ] Criar sala por codigo.
- [ ] Entrar em sala por codigo.
- [ ] Atribuir jogador A e jogador B.
- [ ] Permitir espectador apenas se for decidido futuramente.
- [ ] Escolher decks antes de iniciar.
- [ ] Iniciar partida quando ambos estiverem prontos.
- [ ] Reconexao simples por `playerSessionToken`.
- [ ] Encerrar sala apos partida.
- [ ] Definir expiracao de sala inativa.

Critério de aceite:

- Dois navegadores entram na mesma sala.
- Ambos escolhem decks validos.
- Um jogador executa acao e o outro ve a atualizacao.
- Reconexao simples funciona enquanto a partida existir.

### Fase 15 - Persistencia, Usuarios E Login

- [ ] Escolher provedor Auth.
- [ ] Criar tabela `profiles`.
- [ ] Criar nome publico unico.
- [ ] Criar login usuario/senha.
- [ ] Criar sessao persistente.
- [ ] Salvar historico minimo de partidas.
- [ ] Criar tela de perfil simples.

Critério de aceite:

- Usuario cria conta.
- Usuario entra.
- Usuario joga uma partida.
- Resultado fica salvo.

### Fase 16 - Decks De Usuario Em Banco

- [ ] Usuario logado pode salvar deck no backend.
- [ ] Usuario pode recuperar decks salvos.
- [ ] Deckbuilder publico mostra botao de salvar se logado.
- [ ] Deckbuilder publico mostra lista de decks do usuario se logado.
- [ ] Validacao server-side do deck.
- [ ] Deck valido pode ser usado em sala.

Critério de aceite:

- Usuario monta deck, salva e joga com ele online.

### Fase 17 - Ranking, Pontos E Temporadas

- [ ] Escolher algoritmo inicial:
  - Elo simples;
  - ou Glicko-2.
- [ ] Criar tabela `ratings`.
- [ ] Criar tabela `rating_events`.
- [ ] Registrar rating antes/depois.
- [ ] Contabilizar vitoria.
- [ ] Contabilizar derrota.
- [ ] Contabilizar empate.
- [ ] Contabilizar derrota por desconexao.
- [ ] Criar ranking global.
- [ ] Criar campo de temporada.
- [ ] Criar controle manual de temporada pela organizacao.
- [ ] Definir pontos exibidos ao usuario.

Recomendacao:

Comecar com Elo simples se quisermos velocidade. Migrar para Glicko-2 antes de abrir beta publico. Glicko-2 e melhor para base pequena e jogadores com poucas partidas.

Critério de aceite:

- Partida ranqueada altera rating.
- Ranking global aparece no site/app.

### Fase 18 - Quick Match E Matchmaking

- [ ] Criar fila de matchmaking.
- [ ] Prioridade 1: rating proximo.
- [ ] Prioridade 2: formato compativel.
- [ ] Prioridade 3: qualquer jogador disponivel.
- [ ] Tempo de busca aumenta tolerancia de rating.
- [ ] Criar cancelamento de fila.
- [ ] Criar confirmacao de partida encontrada.

Critério de aceite:

- Dois usuarios entram na fila e sao pareados.

### Fase 19 - Timer Estilo Corda

- [ ] Criar modelo de tempo por decisao.
- [ ] Criar reserva de tempo.
- [ ] Criar corda visual.
- [ ] Criar auto-pass em prioridade simples.
- [ ] Criar penalidade por inatividade.
- [ ] Criar derrota por abandono/inatividade extrema.

Critério de aceite:

- Jogador inativo nao trava partida indefinidamente.

## 7. Modelo Inicial De Banco

Status:

- Planejamento futuro.
- Nao implementar antes da Validacao Local 1.0.
- Este modelo existe para nao perder as decisoes sociais, mas nao deve puxar prioridade agora.

### `profiles`

- `id`
- `auth_user_id`
- `username`
- `display_name`
- `avatar_url`
- `title`
- `created_at`
- `updated_at`

### `official_decks`

- `id`
- `source_json_id`
- `name_pt`
- `name_en`
- `cards_json`
- `identity_json`
- `is_active`

### `user_decks`

- `id`
- `profile_id`
- `name`
- `cards_json`
- `identity_json`
- `is_valid`
- `validation_errors_json`
- `created_at`
- `updated_at`

### `rooms`

- `id`
- `room_code`
- `status`
- `created_by_profile_id`
- `created_at`
- `expires_at`

### `matches`

- `id`
- `room_id`
- `season_id`
- `status`
- `winner_profile_id`
- `result_type`
- `started_at`
- `ended_at`
- `duration_seconds`
- `game_seed`
- `final_state_json`

### `match_players`

- `id`
- `match_id`
- `profile_id`
- `seat`
- `deck_snapshot_json`
- `rating_before`
- `rating_after`
- `result`
- `disconnect_count`

### `rating_events`

- `id`
- `season_id`
- `match_id`
- `profile_id`
- `rating_before`
- `rating_after`
- `rating_delta`
- `opponent_rating`
- `result`
- `created_at`

### `seasons`

- `id`
- `name`
- `status`
- `starts_at`
- `ends_at`
- `created_at`

## 8. Modelo Inicial De GameState

```js
{
  id: "match-id",
  seed: "deterministic-seed",
  status: "setup|active|finished",
  turnNumber: 1,
  activePlayerId: "player-a",
  priorityPlayerId: "player-a",
  phase: "prepare|draw|consecration|main|combat|regroup|discard",
  subphase: null,
  players: {
    "player-a": {
      profileId: "profile-id",
      lifeStatus: "active|lost|conceded|disconnected",
      identity: {
        champion: "FND-CMP-045",
        territory: "FND-TER-041",
        temple: "FND-TEM-051",
        territoryDamage: 0,
        championCovered: false
      },
      deck: [],
      hand: [],
      battlefield: [],
      essence: [],
      cemetery: [],
      exile: [],
      reserve: [],
      flags: {},
      counters: {}
    }
  },
  stack: [],
  combat: null,
  log: []
}
```

## 9. Modelo Inicial De GameAction

```js
{
  id: "action-id",
  matchId: "match-id",
  playerId: "player-a",
  type: "PASS_PRIORITY",
  payload: {},
  clientVersion: 12,
  createdAt: "iso-date"
}
```

Tipos iniciais:

- `CREATE_GAME`
- `START_GAME`
- `DRAW_CARD`
- `PASS_PRIORITY`
- `ADVANCE_PHASE`
- `CONSECRATE_CARD`
- `PLAY_CARD`
- `SELECT_TARGET`
- `DECLARE_ATTACKER`
- `DECLARE_BLOCKER`
- `PASS_COMBAT`
- `CONCEDE`
- `RECONNECT`

Tipos obrigatorios para Local 1.0:

- `MULLIGAN_SELECT`
- `REDUCE_DECK_SELECT`
- `ACTIVATE_ABILITY`
- `ORDER_TRIGGERS`
- `ORDER_BLOCKERS`
- `SEARCH_CARD`
- `CHOOSE_MODE`
- `CHOOSE_X`
- `PAY_COST`
- `AUTO_PASS_SETTINGS`

Observacao:

- Esses tipos podem nao entrar no primeiro prototipo basico.
- Eles devem entrar antes de WebSocket, usuarios, ranking ou banco.

## 10. Estrategia Para As 52 Cartas

Problema:

O texto das cartas existe em linguagem natural. Para engine local, bot e futuro servidor autoritativo, precisamos transformar textos em efeitos estruturados.

Abordagem recomendada:

1. Criar catalogo estruturado em arquivo separado.
2. Manter `cards.json` como fonte editorial.
3. Criar `data/engine/abilities.json` e `data/engine/effect_actions.json`.
4. Usar o catalogo localmente primeiro, contra bot.
5. Reaproveitar o mesmo catalogo no servidor WebSocket depois.
6. Para cada carta, mapear:
   - custo;
   - timing;
   - alvo;
   - gatilho;
   - efeito;
   - duracao;
   - restricoes;
   - tags de implementacao.

Estados de implementacao:

- `not_implemented`
- `stub`
- `basic`
- `complete`
- `needs_ruling`

Regra de produto:

- Carta sem efeito implementado nao deve virar comportamento invisivel.
- Ela deve estar bloqueada, marcada como `stub` ou jogavel como vanilla de forma explicita.
- O jogador/testador deve conseguir entender quando uma carta ainda esta incompleta.
- O bot deve ignorar ou usar de forma simples cartas incompletas, sem quebrar a partida.

Exemplo:

```js
{
  cardId: "FND-PER-011",
  status: "basic",
  effects: [
    {
      trigger: "ENTERS_BATTLEFIELD",
      targets: [],
      actions: [
        { type: "DRAW", player: "controller", amount: 1 },
        { type: "HEAL_TERRITORY", player: "controller", amount: 2 }
      ]
    }
  ]
}
```

## 11. Perguntas Pendentes

### Produto

- [ ] O nome publico do modo de jogo sera "Adonai Play", "Adonai Arena", "Adonai Treino" ou outro?
- [ ] O link principal no site deve aparecer no menu como "Jogar", "Arena", "Online" ou "Play"?
- [ ] O app `/play/` deve ter visual totalmente integrado ao site ou mais parecido com HUD de jogo full-screen?
- [ ] Ao sair do deckbuilder para `/play/`, o deck deve ir por `localStorage`, texto importavel ou outro formato?
- [ ] Em `decks.html`, o botao deve ser "Jogar contra bot", "Testar deck" ou "Jogar"?

### Conta - Pos Local 1.0

- [ ] Login por usuario/senha sera feito por Supabase Auth ou backend proprio?
- [ ] Usuario podera alterar `username` depois?
- [ ] Nome publico sera case-insensitive?
- [ ] Haverá moderacao/bloqueio de nomes ofensivos?
- [ ] Perfil publico mostra historico completo ou apenas resumo?

### Partida Online - Pos Local 1.0

- [ ] Quanto tempo uma sala privada fica viva antes de expirar?
- [ ] Quanto tempo uma partida desconectada fica aguardando reconexao?
- [ ] Desconexao na tela de mulligan/setup conta igual a desconexao em partida ativa?
- [ ] Se ambos desconectarem, a partida e cancelada, empate ou derrota dupla?
- [ ] Um jogador pode sair da sala antes da partida comecar sem penalidade?

### Regras

- [ ] No primeiro MVP, carta com texto nao implementado sera bloqueada ou jogavel como vanilla?
- [ ] Cartas de Identidade terao habilidades ativas no MVP inicial?
- [ ] Pecados podem ser jogados no MVP simplificado sem pilha?
- [ ] Milagres com timing aberto exigem prioridade completa ou serao temporariamente limitados?
- [ ] Ataques a Personagem entram antes ou depois de ataques somente ao Territorio?
- [ ] Como a UI deve explicar mulligan e reducao sem ficar pesada no mobile?
- [ ] O bot deve sempre aceitar/rejeitar mulligan automaticamente ou seguir uma heuristica por curva/mao?

### Ranking - Pos Local 1.0

- [ ] Comecar com Elo ou Glicko-2?
- [ ] Rating inicial sera 1000, 1200 ou 1500?
- [ ] Temporada reseta rating totalmente ou aplica soft reset?
- [ ] Ranking mostra top 10, top 50 ou todos?
- [ ] Partidas privadas contam para ranking desde o inicio?

### Infra - Pos Local 1.0

- [ ] Aceitar servidor local ate validarmos engine/UI?
- [ ] Para primeiro teste online real, preferir Render Free, Railway Hobby ou Fly.io?
- [ ] Aceitar cartao cadastrado em provedor mesmo buscando custo R$0?
- [ ] O dominio final ja existe ou ainda sera escolhido?
- [ ] Se frontend fica no GitHub Pages, como faremos `/play/` e variaveis de ambiente publicas?

## 12. Riscos Tecnicos

- [ ] Regras em linguagem natural podem ser ambiguas para engine.
- [ ] Implementar todas as 52 cartas de uma vez pode atrasar o primeiro prototipo basico, mas e necessario antes da Validacao Local 1.0.
- [ ] Pilha/prioridade completa e a parte mais delicada do jogo.
- [ ] Busca em zonas privadas exige cuidado para evitar vazamento de informacao.
- [ ] Criar WebSocket, usuarios, ranking ou banco antes da Validacao Local 1.0 pode desperdiçar tempo em infraestrutura enquanto as regras ainda estao instaveis.
- [ ] Reconexao exige separar identidade do usuario, sessao do navegador e assento na partida.
- [ ] Servidor autoritativo exige que o cliente nunca seja fonte da verdade.
- [ ] Infra free pode dormir e quebrar experiencia realtime.
- [ ] Ranking desde cedo sem anti-abuso pode ser explorado por contas fake.

## 13. Recomendacao De Escopo Para Primeiro Prototipo

Primeiro prototipo tecnico deve validar localmente:

- [ ] `/play/` existe.
- [ ] UI mobile first existe.
- [ ] Jogador humano existe.
- [ ] Bot local existe.
- [ ] Deck oficial do humano carrega.
- [ ] Deck oficial do bot carrega.
- [ ] Identidade aparece.
- [ ] Mao aparece.
- [ ] Campo aparece.
- [ ] Jogador consegue comprar.
- [ ] Jogador consegue jogar carta simplificada.
- [ ] Jogador consegue passar turno.
- [ ] Bot consegue jogar turno basico.
- [ ] Cartas possuem status de implementacao.
- [ ] Pelo menos um conjunto inicial de cartas reais funciona.
- [ ] Animacoes basicas existem.
- [ ] Sons basicos existem.
- [ ] Som pode ser desligado.
- [ ] Dano no Territorio encerra partida.
- [ ] Log registra acoes.

Pode ficar fora do primeiro prototipo tecnico, mas precisa entrar antes do online:

- [ ] Mulligan.
- [ ] Reducao de deck.
- [ ] Pilha completa.
- [ ] Prioridade completa.
- [ ] Combate completo.
- [ ] Todas as cartas completas.
- [ ] Integracao deckbuilder -> `/play/`.
- [ ] Integracao `decks.html` -> `/play/`.

Nao validar antes da versao local 1.0:

- [ ] WebSocket.
- [ ] Sala privada online.
- [ ] Login.
- [ ] Banco de dados.
- [ ] Salvar decks em nuvem.
- [ ] Ranking.
- [ ] Pontos.
- [ ] Quick match.
- [ ] Matchmaking.
- [ ] Chat.
- [ ] Timer anti-slow-play online.

Versao Local 1.0 deve validar:

- [ ] Usuario monta deck no deckbuilder e joga contra bot.
- [ ] Usuario escolhe precon em `decks.html` e joga contra bot.
- [ ] Partida completa termina corretamente.
- [ ] Mulligan funciona.
- [ ] Reducao funciona.
- [ ] Pilha funciona.
- [ ] Prioridade funciona.
- [ ] Combate funciona.
- [ ] Cartas dos decks oficiais funcionam.
- [ ] Animacoes e sons comunicam as acoes.
- [ ] Mobile e desktop estao jogaveis.

## 14. Prompt Mestre Para Iniciar Implementacao

```text
Voce e um engenheiro senior construindo a base jogavel local de Adonai Card Game dentro do repo existente.

Objetivo imediato: criar o primeiro prototipo local em /play/ usando HTML/CSS/JS puro, sem backend, carregando data/game/cards.json e data/game/decks.json, com UI mobile first, GameState local e uma partida jogavel contra bot.

Respeite data/plans/ONLINE_GAME_PLAN.md.

Escopo:
- Criar /play/index.html, /play/play.css e /play/play.js.
- Criar um pequeno engine local em JS puro.
- Separar GameState, GameAction, regras e renderizacao para que a mesma base possa ser usada futuramente em WebSocket.
- Carregar decks oficiais de data/game/decks.json.
- Permitir iniciar uma partida local humano vs bot com dois decks oficiais.
- Renderizar identidades, mao, deck, campo, cemiterio, territorio/dano e log.
- Permitir acoes simples: comprar carta, passar turno, jogar carta simplificada no campo, causar dano de teste ao territorio e conceder.
- Criar bot simples que executa turnos basicos sem acessar o estado diretamente fora de GameAction.
- Criar estrutura inicial de card effects com status por carta.
- Criar animacoes e sons basicos, com opcao de silenciar.
- Nao implementar backend, WebSocket, login, ranking, timer, pilha completa ou efeitos complexos ainda.

Criterios de aceite:
- /play/ abre no navegador.
- A UI funciona bem em mobile.
- O estado da partida e renderizado corretamente.
- Acoes alteram o GameState de forma previsivel.
- O jogador consegue jogar contra bot ate vitoria, derrota ou concessao.
- O bot consegue jogar sem travar.
- Cartas incompletas ficam explicitamente marcadas, simplificadas ou bloqueadas.
- O codigo fica isolado do site atual.
```

## 15. Prompt Mestre Para Local 1.0 Antes Do Online

```text
Voce e um engenheiro senior evoluindo o modo /play/ de Adonai Card Game.

Objetivo: transformar o prototipo local em uma versao Local 1.0 completa contra bot, antes de qualquer WebSocket, usuario, banco, ranking, matchmaking ou custo pago.

Respeite data/plans/ONLINE_GAME_PLAN.md e data/rules/comprehensive_rules.md.

Escopo:
- Integrar deckbuilder -> /play/ usando estado local/export.
- Integrar decks.html -> /play/ usando decks pre-construidos.
- Permitir humano vs bot com decks reais.
- Implementar mulligan.
- Implementar reducao pre-jogo.
- Implementar pilha.
- Implementar prioridade.
- Implementar combate completo.
- Implementar habilidades ativadas e desencadeadas necessarias para as cartas atuais.
- Implementar alvos, busca, efeitos continuos, equipamentos, fichas e acoes baseadas no estado conforme exigido pelas cartas atuais.
- Completar catalogo de efeitos das 52 cartas ou marcar explicitamente `needs_ruling`.
- Melhorar bot para conseguir jogar uma partida completa sem acesso direto ao estado fora de GameAction.
- Validar animacoes, sons, UX mobile e UX desktop.
- Nao implementar WebSocket, sala online, login, banco, ranking, pontos, matchmaking, chat ou decks salvos em nuvem.

Criterios de aceite:
- O usuario consegue montar um deck no deckbuilder e jogar uma partida completa contra bot.
- O usuario consegue selecionar um precon em decks.html e jogar uma partida completa contra bot.
- Mulligan, reducao, pilha, prioridade e combate funcionam conforme as regras.
- Cartas dos decks oficiais funcionam ou tem pendencia `needs_ruling` documentada.
- A partida termina corretamente por vitoria, derrota ou concessao.
- Mobile e desktop estao jogaveis.
- A base esta pronta para receber uma camada WebSocket sem reescrever regras.
```

## 16. Checklist De Progresso

- [ ] Plano revisado pelo time.
- [ ] Perguntas pendentes priorizadas.
- [ ] Decisao de stack confirmada.
- [x] `/play/` criado.
- [x] Engine local criado.
- [x] UI local criada.
- [x] Bot local criado.
- [x] Partida local contra bot jogavel.
- [x] Decks oficiais carregados localmente.
- [ ] Catalogo de efeitos das 52 cartas criado.
- [x] Cartas essenciais implementadas em modo local.
- [x] Animacoes basicas criadas.
- [x] Sons basicos criados.
- [ ] Testes locais contra bot realizados.
- [ ] Integracao deckbuilder -> `/play/` criada.
- [ ] Integracao `decks.html` -> `/play/` criada.
- [ ] Mulligan implementado localmente.
- [ ] Reducao implementada localmente.
- [ ] Pilha implementada localmente.
- [ ] Prioridade implementada localmente.
- [ ] Combate completo implementado localmente.
- [ ] Cartas dos decks oficiais completas ou com `needs_ruling`.
- [ ] Validacao Local 1.0 concluida.
- [ ] Gate online/pago aprovado.
- [ ] Adaptador de rede definido.
- [ ] WebSocket local criado depois da validacao local.
- [ ] Sala privada criada depois da validacao local.
- [ ] Auth escolhido.
- [ ] Persistencia criada.
- [ ] Ranking criado.
- [ ] Quick match criado.
- [ ] Timer estilo corda criado.
- [ ] Cartas estruturadas.
- [ ] Regras avancadas implementadas.
