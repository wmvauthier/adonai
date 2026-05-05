const header = document.getElementById("siteHeader");
const primaryNav = document.getElementById("primaryNav");
const mobileToggle = document.getElementById("mobileToggle");
const langButtons = document.querySelectorAll(".lang-btn");
const collectionFilters = document.getElementById("collectionFilters");
const virtueFilters = document.getElementById("virtueFilters");
const chapterGrid = document.getElementById("chapterGrid");
const chapterSummary = document.getElementById("chapterSummary");
const libraryShelvesGrid = document.getElementById("libraryShelvesGrid");
const collectionCount = document.getElementById("collectionCount");
const chapterCount = document.getElementById("chapterCount");
const readingRoomImage = document.getElementById("readingRoomImage");
const readingRoomTitle = document.getElementById("readingRoomTitle");
const readingRoomLead = document.getElementById("readingRoomLead");
const readingCollection = document.getElementById("readingCollection");
const readingCollectionName = document.getElementById("readingCollectionName");
const readingVirtue = document.getElementById("readingVirtue");
const readingArchetype = document.getElementById("readingArchetype");
const readingExcerpt = document.getElementById("readingExcerpt");
const readingOrigin = document.getElementById("readingOrigin");
const readingConflict = document.getElementById("readingConflict");
const readingLegacy = document.getElementById("readingLegacy");
const readingNotes = document.getElementById("readingNotes");

let currentLang = "pt";
let activeCollection = "all";
let activeVirtue = "all";
let activeChapterId = 1;

const loreLibrary = [
  {
    id: "aurora",
    order: 1,
    title: { pt: "Livro da Aurora", en: "Book of Dawn" },
    period: { pt: "Primeira coleção", en: "First set" },
    description: {
      pt: "Volume inaugural centrado no despertar da luz, no juramento dos guardiões e nas primeiras alianças do reino.",
      en: "Opening volume centered on the awakening of light, the guardians' oath, and the kingdom's first alliances."
    },
    tags: {
      pt: ["Fundação do reino", "Guardiões", "Justiça"],
      en: ["Kingdom foundation", "Guardians", "Justice"]
    },
    image: "https://picsum.photos/seed/adonar-book-aurora/900/1200",
    chapters: [
      {
        id: 1,
        title: { pt: "Leão da Aurora", en: "Lion of Dawn" },
        virtue: { pt: "Justiça", en: "Justice" },
        archetype: {
          pt: "Mártir, guardião e porta-estandarte.",
          en: "Martyr, guardian, and standard-bearer."
        },
        excerpt: {
          pt: "O primeiro guardião a receber a chama da aurora, destinado a sustentar a muralha quando o céu ainda tremia de silêncio.",
          en: "The first guardian to receive the dawn flame, destined to hold the wall while the sky still trembled in silence."
        },
        lead: {
          pt: "Guardião da primeira luz, seu capítulo introduz o peso do chamado, a nobreza do sacrifício e a violência serena da justiça divina.",
          en: "Guardian of the first light, his chapter introduces the burden of calling, the nobility of sacrifice, and the serene violence of divine justice."
        },
        origin: {
          pt: "Antes de vestir a armadura dourada, o Leão da Aurora era um vigia sem nome nas muralhas de Salém. Quando os sinos da madrugada soaram pela primeira vez, ele foi o único a permanecer de pé diante do clarão que abriu o céu.",
          en: "Before wearing the golden armor, the Lion of Dawn was a nameless watcher on Salem's walls. When the bells of morning rang for the first time, he was the only one who remained standing before the blaze that opened the heavens."
        },
        conflict: {
          pt: "Seu voto de proteger o reino exige dureza absoluta, mas cada vitória o afasta do homem que um dia jurou salvar o povo sem se perder de si mesmo.",
          en: "His vow to protect the realm demands absolute hardness, yet every victory pushes him farther from the man who once swore to save the people without losing himself."
        },
        legacy: {
          pt: "Hoje, seu nome aparece nos estandartes das fortalezas e nas canções dos recrutas. Para muitos, ele não é apenas herói: é a forma que a aurora escolheu para atravessar a guerra.",
          en: "Today, his name appears on fortress banners and in recruits' songs. To many, he is not merely a hero: he is the form dawn chose to cross the war."
        },
        notes: {
          pt: [
            "A muralha de Salém marca a fronteira entre o mundo visível e a névoa do Véu.",
            "Sua armadura foi forjada com ouro ritual e cinzas de sinos consagrados.",
            "É citado em outros capítulos como o primeiro nome pronunciado antes de uma marcha."
          ],
          en: [
            "The wall of Salem marks the boundary between the visible world and the Veil mist.",
            "His armor was forged with ritual gold and the ashes of consecrated bells.",
            "He is cited in other chapters as the first name spoken before a march."
          ]
        },
        image: "https://picsum.photos/seed/adonar-lion-dawn/1200/1500"
      },
      {
        id: 2,
        title: { pt: "Escriba do Véu", en: "Scribe of the Veil" },
        virtue: { pt: "Sabedoria", en: "Wisdom" },
        archetype: {
          pt: "Cronista, decifrador e observador do invisível.",
          en: "Chronicler, decipherer, and observer of the unseen."
        },
        excerpt: {
          pt: "Aquele que escreveu o primeiro índice das coisas sagradas e percebeu que todo milagre deixa sombra.",
          en: "The one who wrote the first index of sacred things and realized that every miracle leaves a shadow."
        },
        lead: {
          pt: "Seu capítulo apresenta a biblioteca como campo de batalha silencioso, onde a interpretação correta pode mudar o destino do reino.",
          en: "His chapter presents the library as a silent battlefield, where correct interpretation can change the fate of the realm."
        },
        origin: {
          pt: "Filho de copistas, o Escriba cresceu entre tábuas rachadas, velas frias e pergaminhos tratados como relíquias. Seu dom não era prever; era reconhecer o padrão quando todos viam apenas ruído.",
          en: "Son of copyists, the Scribe grew among cracked desks, cold candles, and scrolls treated as relics. His gift was not foresight; it was recognizing pattern where everyone else saw only noise."
        },
        conflict: {
          pt: "Cada segredo revelado oferece vantagem ao reino, mas também rouba um pouco da inocência daqueles que ainda acreditam na pureza absoluta da luz.",
          en: "Every secret revealed grants advantage to the kingdom, but also steals a little innocence from those who still believe in the absolute purity of light."
        },
        legacy: {
          pt: "Os capítulos posteriores citam seus cadernos como fonte de doutrina, suspeita e profecia. Em Adonar, ninguém lê o mundo sem antes passar por suas anotações.",
          en: "Later chapters cite his notebooks as a source of doctrine, suspicion, and prophecy. In Adonar, no one reads the world without first passing through his annotations."
        },
        notes: {
          pt: [
            "Seu arquivo pessoal é chamado de Catálogo do Véu.",
            "Foi o primeiro personagem a registrar fissuras entre milagre e política.",
            "Mantém relação ambígua com os juízes da Aurora."
          ],
          en: [
            "His personal archive is called the Catalogue of the Veil.",
            "He was the first character to record fractures between miracle and politics.",
            "He maintains an ambiguous relationship with the Judges of Dawn."
          ]
        },
        image: "https://picsum.photos/seed/adonar-scribe-veil/1200/1500"
      },
      {
        id: 3,
        title: { pt: "Arauto da Alvorada", en: "Herald of Daybreak" },
        virtue: { pt: "Fé", en: "Faith" },
        archetype: {
          pt: "Mensageiro, iniciador e chama popular.",
          en: "Messenger, initiator, and popular flame."
        },
        excerpt: {
          pt: "O rosto mais humano da aurora: aquele que correu pelas ruas para transformar anúncio em mobilização.",
          en: "The most human face of dawn: the one who ran through the streets to turn proclamation into movement."
        },
        lead: {
          pt: "Seu capítulo abre a dimensão popular do mundo, mostrando como o reino é sustentado também por vozes menores e joelhos cansados.",
          en: "His chapter opens the world's popular dimension, showing how the kingdom is also sustained by smaller voices and weary knees."
        },
        origin: {
          pt: "Ele surgiu entre mercados e escadarias, repetindo decretos sagrados a quem jamais pisaria no salão dos juízes. Sua palavra carregava calor e urgência.",
          en: "He emerged among markets and stairways, repeating sacred decrees to those who would never set foot in the judges' hall. His voice carried warmth and urgency."
        },
        conflict: {
          pt: "Quanto mais proclama a esperança, mais testemunha a distância entre o ideal da coroa e a fome do povo.",
          en: "The more he proclaims hope, the more he witnesses the distance between the crown's ideal and the people's hunger."
        },
        legacy: {
          pt: "As legiões o lembram como a primeira centelha. Não pelo poder, mas pela capacidade de fazer a cidade inteira respirar no mesmo ritmo.",
          en: "The legions remember him as the first spark. Not for power, but for making the whole city breathe in the same rhythm."
        },
        notes: {
          pt: [
            "É frequentemente associado às procissões do amanhecer.",
            "Seu sino portátil reaparece como relíquia em capítulos posteriores.",
            "Tem laços narrativos com o Leão da Aurora e com as viúvas do Portão Leste."
          ],
          en: [
            "He is frequently associated with dawn processions.",
            "His portable bell reappears as a relic in later chapters.",
            "He has narrative ties to the Lion of Dawn and the widows of the East Gate."
          ]
        },
        image: "https://picsum.photos/seed/adonar-herald-daybreak/1200/1500"
      }
    ]
  },
  {
    id: "mercy",
    order: 2,
    title: { pt: "Cântico da Misericórdia", en: "Canticle of Mercy" },
    period: { pt: "Segunda coleção", en: "Second set" },
    description: {
      pt: "Livro que desloca o foco para cura, luto, restauração e os custos invisíveis da sobrevivência espiritual.",
      en: "A book that shifts focus toward healing, mourning, restoration, and the invisible costs of spiritual survival."
    },
    tags: {
      pt: ["Restauração", "Luto", "Misericórdia"],
      en: ["Restoration", "Mourning", "Mercy"]
    },
    image: "https://picsum.photos/seed/adonar-book-mercy/900/1200",
    chapters: [
      {
        id: 4,
        title: { pt: "Manto de Reversão", en: "Mantle of Reversal" },
        virtue: { pt: "Misericórdia", en: "Mercy" },
        archetype: {
          pt: "Guardião de retorno e testemunha do quase fim.",
          en: "Keeper of return and witness of the almost-end."
        },
        excerpt: {
          pt: "A vestimenta cerimonial que não impede a morte, mas discute com ela até arrancar uma segunda chance.",
          en: "The ceremonial garment that does not prevent death, but argues with it until it tears out a second chance."
        },
        lead: {
          pt: "Este capítulo narra a misericórdia como ato custoso: preservar alguém significa aceitar o peso de trazê-lo de volta diferente.",
          en: "This chapter frames mercy as a costly act: preserving someone means accepting the weight of bringing them back changed."
        },
        origin: {
          pt: "O manto foi tecido pelas viúvas do Sul com fios ungidos e nomes sussurrados. Cada dobra guarda uma memória de perda que se recusou a se tornar ausência definitiva.",
          en: "The mantle was woven by the South widows with anointed threads and whispered names. Each fold holds a memory of loss that refused to become final absence."
        },
        conflict: {
          pt: "Seu poder exige que a dor não seja apagada, apenas reordenada. Quem retorna carregando o manto volta salvo, mas jamais intacto.",
          en: "Its power requires pain not to be erased, only reordered. Whoever returns wearing the mantle comes back saved, but never untouched."
        },
        legacy: {
          pt: "Tornou-se símbolo das ordens de restauração e das casas que recolhem sobreviventes após as grandes batalhas do reino.",
          en: "It became the symbol of restoration orders and the houses that gather survivors after the kingdom's great battles."
        },
        notes: {
          pt: [
            "É tratado como objeto e personagem ao mesmo tempo.",
            "Seu capítulo estabelece as regras espirituais do retorno em Adonar.",
            "Aparece associado à Casa das Lâmpadas Veladas."
          ],
          en: [
            "It is treated as object and character at the same time.",
            "Its chapter establishes the spiritual rules of return in Adonar.",
            "It appears associated with the House of Veiled Lamps."
          ]
        },
        image: "https://picsum.photos/seed/adonar-mantle-reversal/1200/1500"
      },
      {
        id: 5,
        title: { pt: "Véu Rasgado", en: "Torn Veil" },
        virtue: { pt: "Misericórdia", en: "Mercy" },
        archetype: {
          pt: "Ruptura, recomeço e compaixão severa.",
          en: "Rupture, renewal, and severe compassion."
        },
        excerpt: {
          pt: "O momento em que a própria misericórdia deixa de consolar e decide interromper a ordem conhecida para salvar o que resta.",
          en: "The moment mercy itself stops comforting and decides to interrupt the known order to save what remains."
        },
        lead: {
          pt: "Aqui a compaixão surge como força disruptiva, capaz de desfazer estruturas sagradas quando elas já não servem à vida.",
          en: "Here compassion emerges as a disruptive force, capable of undoing sacred structures when they no longer serve life."
        },
        origin: {
          pt: "O rasgo aconteceu durante um rito coletivo de luto, quando a cidade inteira clamou por resposta e o céu respondeu abrindo o tecido entre presença e ausência.",
          en: "The tear happened during a collective mourning rite, when the whole city cried out for an answer and the sky replied by opening the fabric between presence and absence."
        },
        conflict: {
          pt: "A ruptura trouxe cura para alguns e escândalo para outros. Até hoje, sacerdotes discutem se o rasgo foi milagre ou afronta.",
          en: "The rupture brought healing to some and scandal to others. To this day, priests debate whether the tear was miracle or affront."
        },
        legacy: {
          pt: "Seu eco funda correntes teológicas opostas e sustenta personagens que defendem misericórdia sem obediência cega.",
          en: "Its echo founds opposing theological currents and sustains characters who defend mercy without blind obedience."
        },
        notes: {
          pt: [
            "É um dos capítulos mais citados por personagens dissidentes.",
            "Marca o início de disputas entre restauração e autoridade ritual.",
            "Estabelece a imagem do céu costurado como símbolo da coleção."
          ],
          en: [
            "It is one of the most quoted chapters by dissident characters.",
            "It marks the beginning of disputes between restoration and ritual authority.",
            "It establishes the stitched sky as the set's symbol."
          ]
        },
        image: "https://picsum.photos/seed/adonar-torn-veil/1200/1500"
      },
      {
        id: 6,
        title: { pt: "Cântico da Casa Velada", en: "Song of the Veiled House" },
        virtue: { pt: "Fé", en: "Faith" },
        archetype: {
          pt: "Coral de cura, abrigo e liturgia doméstica.",
          en: "Healing choir, refuge, and domestic liturgy."
        },
        excerpt: {
          pt: "Um capítulo coral, onde a casa e a oração se tornam a mesma arquitetura de resistência.",
          en: "A choral chapter where home and prayer become the same architecture of resistance."
        },
        lead: {
          pt: "Ele amplia a noção de personagem: às vezes a protagonista é uma comunidade inteira, costurando fé em ritmo de cuidado cotidiano.",
          en: "It broadens the idea of character: sometimes the protagonist is an entire community, stitching faith through the rhythm of daily care."
        },
        origin: {
          pt: "A Casa Velada surgiu como refúgio improvisado, mas cresceu até virar referência para órfãos, feridos e peregrinos sem altar.",
          en: "The Veiled House began as an improvised refuge, but grew into a reference point for orphans, wounded souls, and pilgrims without an altar."
        },
        conflict: {
          pt: "Sua bondade pública atrai aqueles que precisam de abrigo e aqueles que desejam instrumentalizar sua compaixão.",
          en: "Its public kindness attracts both those who need shelter and those who wish to instrumentalize its compassion."
        },
        legacy: {
          pt: "Mais do que lugar, a Casa torna-se método: cuidar como liturgia, acolher como forma de guerra contra o abandono.",
          en: "More than a place, the House becomes a method: care as liturgy, welcome as a form of war against abandonment."
        },
        notes: {
          pt: [
            "Capítulo ideal para expandir em páginas com vários personagens ligados.",
            "Reúne cartas de apoio, cura e proteção sob o mesmo eixo narrativo.",
            "Introduz a estética de véus, velas e madeira escurecida."
          ],
          en: [
            "Ideal chapter to expand into pages with multiple linked characters.",
            "Brings support, healing, and protection cards under one narrative axis.",
            "Introduces the aesthetic of veils, candles, and darkened wood."
          ]
        },
        image: "https://picsum.photos/seed/adonar-veiled-house/1200/1500"
      }
    ]
  },
  {
    id: "wisdom",
    order: 3,
    title: { pt: "Crônicas da Sabedoria", en: "Chronicles of Wisdom" },
    period: { pt: "Terceira coleção", en: "Third set" },
    description: {
      pt: "Volume dedicado a profecia, poder intelectual, cálculo político e à linha tênue entre discernimento e controle.",
      en: "Volume dedicated to prophecy, intellectual power, political calculation, and the fine line between discernment and control."
    },
    tags: {
      pt: ["Profecia", "Estratégia", "Sabedoria"],
      en: ["Prophecy", "Strategy", "Wisdom"]
    },
    image: "https://picsum.photos/seed/adonar-book-wisdom/900/1200",
    chapters: [
      {
        id: 7,
        title: { pt: "Coroa do Reino", en: "Crown of the Realm" },
        virtue: { pt: "Sabedoria", en: "Wisdom" },
        archetype: {
          pt: "Trono, cálculo e visão de longo alcance.",
          en: "Throne, calculation, and long-range sight."
        },
        excerpt: {
          pt: "A coroa aparece menos como ornamento e mais como mecanismo que reorganiza tempo, memória e responsabilidade.",
          en: "The crown appears less as an ornament and more as a mechanism that reorganizes time, memory, and responsibility."
        },
        lead: {
          pt: "Um capítulo sobre o peso do governo sagrado: ver mais longe pode significar viver cada vez menos perto do povo.",
          en: "A chapter about the weight of sacred government: seeing farther may mean living ever less close to the people."
        },
        origin: {
          pt: "Forjada para unificar as tribos da luz, a Coroa do Reino foi erguida como promessa de ordem. Mas toda ordem, em Adonar, pede interpretação antes de obediência.",
          en: "Forged to unify the tribes of light, the Crown of the Realm was raised as a promise of order. Yet every order in Adonar demands interpretation before obedience."
        },
        conflict: {
          pt: "Quanto mais a coroa antecipa o futuro, mais tenta dobrar a história para caber em seus próprios cálculos.",
          en: "The more the crown anticipates the future, the more it tries to bend history to fit its own calculations."
        },
        legacy: {
          pt: "Seu legado divide o reino entre defensores da estabilidade e profetas que temem o custo espiritual do controle absoluto.",
          en: "Its legacy divides the realm between defenders of stability and prophets who fear the spiritual cost of absolute control."
        },
        notes: {
          pt: [
            "Conecta vários capítulos ligados a juízes, escribas e conselhos.",
            "É um ponto de entrada natural para páginas de linha temporal do mundo.",
            "A iconografia da coleção gira em torno de ouro fosco e mármore escurecido."
          ],
          en: [
            "It connects many chapters tied to judges, scribes, and councils.",
            "It is a natural entry point for world timeline pages.",
            "The set's iconography revolves around matte gold and darkened marble."
          ]
        },
        image: "https://picsum.photos/seed/adonar-crown-realm/1200/1500"
      },
      {
        id: 8,
        title: { pt: "Memória do Trono", en: "Memory of the Throne" },
        virtue: { pt: "Sabedoria", en: "Wisdom" },
        archetype: {
          pt: "Arquivo vivo, eco e conselho ancestral.",
          en: "Living archive, echo, and ancestral counsel."
        },
        excerpt: {
          pt: "Nem toda memória é lembrança; algumas atuam como vontade preservada, aguardando quem saiba ouvi-las.",
          en: "Not every memory is remembrance; some act as preserved will, waiting for someone who knows how to hear them."
        },
        lead: {
          pt: "Seu capítulo introduz a política dos arquivos sagrados e o risco de confundir tradição com voz infalível.",
          en: "Its chapter introduces the politics of sacred archives and the danger of confusing tradition with an infallible voice."
        },
        origin: {
          pt: "As memórias do trono foram recolhidas em lâminas de metal fino, gravadas com decisões antigas e suspiros de reis que morreram sem descanso.",
          en: "The throne's memories were gathered on thin metal leaves engraved with old decisions and the sighs of kings who died without rest."
        },
        conflict: {
          pt: "Consultar o passado ilumina o presente, mas também cria dependência. Quem escuta demais os mortos pode perder a coragem de agir entre os vivos.",
          en: "Consulting the past illuminates the present, but also creates dependency. Those who listen too closely to the dead may lose the courage to act among the living."
        },
        legacy: {
          pt: "Os conselheiros do reino disputam seu acesso, pois dali nasce a autoridade para legitimar decretos, guerras e sucessões.",
          en: "The kingdom's counselors dispute access to it, for from there comes the authority to legitimize decrees, wars, and successions."
        },
        notes: {
          pt: [
            "Capítulo ideal para experiência de lore com documentos, pergaminhos e interfaces de arquivo.",
            "Fortalece a metáfora da biblioteca como centro do universo.",
            "Dialoga diretamente com o Escriba do Véu."
          ],
          en: [
            "Ideal chapter for lore experiences with documents, scrolls, and archive interfaces.",
            "Strengthens the library metaphor as the center of the universe.",
            "Directly dialogues with the Scribe of the Veil."
          ]
        },
        image: "https://picsum.photos/seed/adonar-memory-throne/1200/1500"
      },
      {
        id: 9,
        title: { pt: "Tribunal Silente", en: "Silent Tribunal" },
        virtue: { pt: "Justiça", en: "Justice" },
        archetype: {
          pt: "Câmara oculta, julgamento e política da ausência.",
          en: "Hidden chamber, judgment, and the politics of absence."
        },
        excerpt: {
          pt: "Ninguém vê o tribunal inteiro de uma só vez; conhecer sua forma completa já seria, por si só, um veredito.",
          en: "No one sees the tribunal whole at once; to know its full shape would already be a verdict."
        },
        lead: {
          pt: "Capítulo de tensão silenciosa, onde justiça e segredo dividem o mesmo altar e toda sentença deixa resíduos na alma do reino.",
          en: "A chapter of silent tension, where justice and secrecy share the same altar and every sentence leaves residue on the soul of the realm."
        },
        origin: {
          pt: "O Tribunal nasceu para julgar aquilo que não podia ser pronunciado em praça pública. Seus juízes recebem nomes novos ao assumir a cadeira, apagando o rosto anterior.",
          en: "The Tribunal was born to judge what could not be spoken in public squares. Its judges receive new names when they take the seat, erasing the face that came before."
        },
        conflict: {
          pt: "Ao proteger o reino de ameaças invisíveis, o Tribunal aprende a operar longe demais da luz que deveria representar.",
          en: "While protecting the realm from unseen threats, the Tribunal learns to operate too far from the light it claims to represent."
        },
        legacy: {
          pt: "Toda conspiração importante do universo toca, em algum ponto, os corredores do Tribunal Silente.",
          en: "Every major conspiracy in the universe touches, at some point, the corridors of the Silent Tribunal."
        },
        notes: {
          pt: [
            "Capítulo propício para expansão em mapas, ordens secretas e árvores de personagens.",
            "Cria elo entre Justiça e Sabedoria dentro da lore.",
            "Sua iconografia privilegia pedra negra, selos e luz indireta."
          ],
          en: [
            "A chapter suited for expansion into maps, secret orders, and character trees.",
            "It creates a bridge between Justice and Wisdom within the lore.",
            "Its iconography privileges black stone, seals, and indirect light."
          ]
        },
        image: "https://picsum.photos/seed/adonar-silent-tribunal/1200/1500"
      }
    ]
  },
  {
    id: "kingdom",
    order: 4,
    title: { pt: "Profecias do Reino Partido", en: "Prophecies of the Fractured Kingdom" },
    period: { pt: "Quarta coleção", en: "Fourth set" },
    description: {
      pt: "Livro de guerra interna, ruptura doutrinária e personagens que carregam o reino nas fronteiras de sua própria divisão.",
      en: "A book of inner war, doctrinal fracture, and characters carrying the kingdom at the boundaries of its own division."
    },
    tags: {
      pt: ["Guerra civil", "Profecia", "Fronteiras"],
      en: ["Civil war", "Prophecy", "Frontiers"]
    },
    image: "https://picsum.photos/seed/adonar-book-kingdom/900/1200",
    chapters: [
      {
        id: 10,
        title: { pt: "Escada Celestial", en: "Celestial Ladder" },
        virtue: { pt: "Sabedoria", en: "Wisdom" },
        archetype: {
          pt: "Ascensão ritual, risco e ambição visionária.",
          en: "Ritual ascent, risk, and visionary ambition."
        },
        excerpt: {
          pt: "A estrutura erguida para tocar o céu acabou expondo os desejos mais profundos daqueles que tentaram subi-la.",
          en: "The structure raised to touch the sky ended up exposing the deepest desires of those who tried to climb it."
        },
        lead: {
          pt: "Seu capítulo trata a transcendência como experimento perigoso, misturando revelação genuína e vontade de domínio.",
          en: "Its chapter treats transcendence as a dangerous experiment, mixing genuine revelation and the will to dominate."
        },
        origin: {
          pt: "A Escada foi concebida em segredo por conselhos divididos, todos convencidos de que o céu podia ser vencido por arquitetura e cálculo.",
          en: "The Ladder was conceived in secret by divided councils, all convinced that heaven could be conquered through architecture and calculation."
        },
        conflict: {
          pt: "Subir demais significa perder o chão; descer cedo demais significa admitir que o reino já não suporta seu próprio sonho de altura.",
          en: "To climb too far means losing the ground; to descend too early means admitting the kingdom can no longer bear its own dream of height."
        },
        legacy: {
          pt: "Restam degraus partidos e uma geração inteira marcada pelo desejo de alcançar Deus sem antes atravessar o próximo homem.",
          en: "Broken steps remain, and an entire generation marked by the desire to reach God before first crossing the next human being."
        },
        notes: {
          pt: [
            "Bom capítulo para experiências visuais mais arquitetônicas.",
            "Conecta guerra, profecia e tecnocracia sagrada.",
            "A arte pode explorar verticalidade e névoa dourada."
          ],
          en: [
            "A strong chapter for more architectural visual experiences.",
            "Connects war, prophecy, and sacred technocracy.",
            "The artwork can explore verticality and golden mist."
          ]
        },
        image: "https://picsum.photos/seed/adonar-celestial-ladder/1200/1500"
      },
      {
        id: 11,
        title: { pt: "Guarda do Testamento", en: "Testament Guard" },
        virtue: { pt: "Justiça", en: "Justice" },
        archetype: {
          pt: "Sentinela de fronteira e memória juramentada.",
          en: "Border sentinel and sworn memory."
        },
        excerpt: {
          pt: "Último rosto antes do exílio, primeiro nome lembrado quando o reino precisa provar a si mesmo que ainda tem limites.",
          en: "The last face before exile, the first name remembered when the realm needs to prove to itself that it still has borders."
        },
        lead: {
          pt: "Este capítulo é sobre vigiar não apenas territórios, mas promessas antigas que insistem em ruir sob pressão.",
          en: "This chapter is about guarding not only territories, but old promises that keep collapsing under pressure."
        },
        origin: {
          pt: "Criados para defender portões esquecidos, os Guardas do Testamento receberam juramentos gravados na carne e na lâmina.",
          en: "Created to defend forgotten gates, the Testament Guards received vows carved into flesh and blade."
        },
        conflict: {
          pt: "Quando o centro do reino se fragmenta, a fronteira deixa de saber a quem obedece — e passa a decidir sozinha o que merece continuar vivo.",
          en: "When the center of the realm fractures, the frontier stops knowing whom to obey—and begins deciding on its own what deserves to remain alive."
        },
        legacy: {
          pt: "Sua imagem sintetiza a dureza da quarta coleção: manter um juramento quando o próprio trono já não o honra por inteiro.",
          en: "Its image synthesizes the harshness of the fourth set: keeping an oath when the throne itself no longer honors it fully."
        },
        notes: {
          pt: [
            "Capítulo forte para cruzar lore e gameplay competitivo.",
            "Ajuda a explicar a brutalidade visual das cartas de fronteira.",
            "Tem relação direta com o Tribunal Silente."
          ],
          en: [
            "A strong chapter for crossing lore and competitive gameplay.",
            "Helps explain the visual brutality of frontier cards.",
            "Has a direct relationship with the Silent Tribunal."
          ]
        },
        image: "https://picsum.photos/seed/adonar-testament-guard/1200/1500"
      },
      {
        id: 12,
        title: { pt: "Porta do Último Amém", en: "Gate of the Last Amen" },
        virtue: { pt: "Fé", en: "Faith" },
        archetype: {
          pt: "Passagem, despedida e esperança sob cerco.",
          en: "Passage, farewell, and hope under siege."
        },
        excerpt: {
          pt: "A porta diante da qual exércitos se calam, mães choram baixo e profetas decidem se o fim será fuga ou envio.",
          en: "The gate before which armies fall silent, mothers weep softly, and prophets decide whether the end will be flight or sending."
        },
        lead: {
          pt: "Fechando a biblioteca, este capítulo oferece uma imagem de fim aberto: não o colapso do reino, mas sua travessia dolorosa para outra forma de fidelidade.",
          en: "Closing the library, this chapter offers an image of open ending: not the collapse of the realm, but its painful crossing into another form of faithfulness."
        },
        origin: {
          pt: "A porta foi erguida para selar procissões triunfais, mas ganhou outro sentido quando se tornou a saída dos que ainda acreditavam no reino sem se curvar ao seu orgulho.",
          en: "The gate was built to seal triumphant processions, but gained another meaning when it became the exit for those who still believed in the realm without bowing to its pride."
        },
        conflict: {
          pt: "Partir preserva a fé, mas deixa a cidade entregue ao peso de suas próprias escolhas. Ficar honra a história, mas pode significar corromper a alma.",
          en: "Leaving preserves faith, but leaves the city under the weight of its own choices. Staying honors history, but may mean corrupting the soul."
        },
        legacy: {
          pt: "O capítulo inaugura a possibilidade de expansões futuras: diáspora, recomeço e novas alianças além das muralhas sagradas.",
          en: "The chapter opens the possibility of future expansions: diaspora, renewal, and new alliances beyond the sacred walls."
        },
        notes: {
          pt: [
            "Excelente gancho para a próxima coleção do jogo.",
            "Encapsula visualmente despedida, poeira dourada e horizonte escuro.",
            "Pode servir como epílogo ou prólogo dependendo da arquitetura do site."
          ],
          en: [
            "An excellent hook for the game's next set.",
            "Visually encapsulates farewell, golden dust, and dark horizon.",
            "Can serve as either epilogue or prologue depending on site architecture."
          ]
        },
        image: "https://picsum.photos/seed/adonar-last-amen/1200/1500"
      }
    ]
  }
];

const allChapters = loreLibrary.flatMap((collection) =>
  collection.chapters.map((chapter) => ({
    ...chapter,
    collectionId: collection.id,
    collectionOrder: collection.order,
    collectionTitle: collection.title,
    collectionPeriod: collection.period,
  })),
);

function handleHeader() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 20);
}

function handleReveal() {
  const trigger = window.innerHeight * 0.9;
  document.querySelectorAll(".reveal").forEach((element) => {
    if (element.getBoundingClientRect().top < trigger) {
      element.classList.add("is-visible");
    }
  });
}

function handleParallax() {
  const heroImage = document.querySelector(".lore-hero-media img");
  if (!heroImage) return;
  const offset = window.scrollY * 0.12;
  heroImage.style.transform = `scale(1.05) translateY(${offset}px)`;
}

mobileToggle?.addEventListener("click", () => {
  const isOpen = primaryNav.classList.toggle("is-open");
  mobileToggle.setAttribute("aria-expanded", String(isOpen));
});

primaryNav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    primaryNav.classList.remove("is-open");
    mobileToggle?.setAttribute("aria-expanded", "false");
  });
});

function createChip(text, isActive, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `toolbar-chip${isActive ? " is-active" : ""}`;
  button.textContent = text;
  button.addEventListener("click", onClick);
  return button;
}

function renderFilters() {
  collectionFilters.innerHTML = "";
  virtueFilters.innerHTML = "";

  collectionFilters.appendChild(
    createChip(currentLang === "pt" ? "Todos os livros" : "All books", activeCollection === "all", () => {
      activeCollection = "all";
      renderFilters();
      renderChapters();
    }),
  );

  loreLibrary.forEach((collection) => {
    collectionFilters.appendChild(
      createChip(collection.title[currentLang], activeCollection === collection.id, () => {
        activeCollection = collection.id;
        renderFilters();
        renderChapters();
      }),
    );
  });

  const virtues = [...new Set(allChapters.map((chapter) => chapter.virtue[currentLang]))];

  virtueFilters.appendChild(
    createChip(currentLang === "pt" ? "Todas as virtudes" : "All virtues", activeVirtue === "all", () => {
      activeVirtue = "all";
      renderFilters();
      renderChapters();
    }),
  );

  virtues.forEach((virtue) => {
    virtueFilters.appendChild(
      createChip(virtue, activeVirtue === virtue, () => {
        activeVirtue = virtue;
        renderFilters();
        renderChapters();
      }),
    );
  });
}

function getFilteredChapters() {
  return allChapters.filter((chapter) => {
    const matchesCollection = activeCollection === "all" || chapter.collectionId === activeCollection;
    const matchesVirtue = activeVirtue === "all" || chapter.virtue[currentLang] === activeVirtue;
    return matchesCollection && matchesVirtue;
  });
}

function renderLibrary() {
  libraryShelvesGrid.innerHTML = "";

  loreLibrary.forEach((collection, index) => {
    const card = document.createElement("article");
    card.className = `book-card reveal stagger-${(index % 3) + 1}`;

    const firstChapter = collection.chapters[0];
    card.innerHTML = `
      <div class="book-spine" aria-hidden="true"></div>
      <div class="book-cover">
        <img src="${collection.image}" alt="${collection.title[currentLang]}">
        <span class="book-badge">${collection.period[currentLang]}</span>
      </div>
      <div class="book-body">
        <div class="book-head">
          <div>
            <h3>${collection.title[currentLang]}</h3>
            <span class="book-meta">${firstChapter.virtue[currentLang]} · ${collection.chapters.length} ${currentLang === "pt" ? "capítulos" : "chapters"}</span>
          </div>
          <div class="book-count">
            <strong>${String(collection.order).padStart(2, "0")}</strong>
            <span>${currentLang === "pt" ? "Livro" : "Book"}</span>
          </div>
        </div>
        <p class="book-description">${collection.description[currentLang]}</p>
        <div class="book-tags">
          ${collection.tags[currentLang].map((tag) => `<span class="book-tag">${tag}</span>`).join("")}
        </div>
        <span class="book-open">${currentLang === "pt" ? "Abrir índice deste livro" : "Open this book index"}</span>
      </div>
    `;

    card.addEventListener("click", () => {
      activeCollection = collection.id;
      renderFilters();
      renderChapters();
      document.getElementById("readingRoom")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    libraryShelvesGrid.appendChild(card);
  });
}

function renderChapters() {
  const filtered = getFilteredChapters();
  chapterGrid.innerHTML = "";

  if (!filtered.some((chapter) => chapter.id === activeChapterId) && filtered[0]) {
    activeChapterId = filtered[0].id;
    updateReadingRoom(activeChapterId);
  }

  const summaryText =
    currentLang === "pt"
      ? `${filtered.length} capítulos visíveis para leitura e expansão editorial.`
      : `${filtered.length} visible chapters ready for reading and editorial expansion.`;

  chapterSummary.textContent = summaryText;

  if (!filtered.length) {
    chapterGrid.innerHTML = `
      <article class="empty-state">
        <h3>${currentLang === "pt" ? "Nenhum capítulo encontrado" : "No chapters found"}</h3>
        <p>${currentLang === "pt" ? "Ajuste os filtros para reencontrar personagens, virtudes e volumes da biblioteca." : "Adjust the filters to rediscover characters, virtues, and volumes from the library."}</p>
      </article>
    `;
    return;
  }

  filtered.forEach((chapter) => {
    const card = document.createElement("article");
    card.className = `chapter-card${chapter.id === activeChapterId ? " is-active" : ""}`;
    card.innerHTML = `
      <div class="chapter-art">
        <img src="${chapter.image}" alt="${chapter.title[currentLang]}">
        <div class="chapter-badges">
          <span class="chapter-badge">${chapter.collectionTitle[currentLang]}</span>
          <span class="chapter-badge">${chapter.virtue[currentLang]}</span>
        </div>
      </div>
      <div class="chapter-body">
        <div>
          <h3>${chapter.title[currentLang]}</h3>
          <div class="chapter-meta">
            <span>${currentLang === "pt" ? "Capítulo" : "Chapter"} ${String(chapter.id).padStart(2, "0")}</span>
            <span>•</span>
            <span>${chapter.archetype[currentLang]}</span>
          </div>
        </div>
        <p class="chapter-excerpt">${chapter.excerpt[currentLang]}</p>
        <span class="chapter-link">${currentLang === "pt" ? "Ler na sala de leitura" : "Read in the reading room"}</span>
      </div>
    `;

    card.addEventListener("click", () => {
      activeChapterId = chapter.id;
      updateReadingRoom(activeChapterId);
      renderChapters();
      document.getElementById("readingRoom")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    chapterGrid.appendChild(card);
  });
}

function updateReadingRoom(chapterId) {
  const chapter = allChapters.find((item) => item.id === chapterId);
  if (!chapter) return;

  readingRoomImage.src = chapter.image;
  readingRoomImage.alt = chapter.title[currentLang];
  readingRoomTitle.textContent = chapter.title[currentLang];
  readingRoomLead.textContent = chapter.lead[currentLang];
  const collectionLabel = chapter.collectionTitle[currentLang];
  readingCollection.textContent = currentLang === "pt" ? `Livro ${String(chapter.collectionOrder).padStart(2, "0")}` : `Book ${String(chapter.collectionOrder).padStart(2, "0")}`;
  readingCollectionName.textContent = chapter.collectionTitle[currentLang];
  readingVirtue.textContent = chapter.virtue[currentLang];
  readingArchetype.textContent = chapter.archetype[currentLang];
  if (readingExcerpt) readingExcerpt.textContent = chapter.excerpt[currentLang];
  readingOrigin.textContent = chapter.origin[currentLang];
  readingConflict.textContent = chapter.conflict[currentLang];
  readingLegacy.textContent = chapter.legacy[currentLang];
  readingNotes.innerHTML = chapter.notes[currentLang].map((item) => `<li>${item}</li>`).join("");
}

function applyLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";

  document.querySelectorAll("[data-pt]").forEach((node) => {
    const value = node.dataset[lang];
    if (typeof value !== "undefined") {
      node.innerHTML = value;
    }
  });

  langButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === lang);
  });

  collectionCount.textContent = String(loreLibrary.length).padStart(2, "0");
  chapterCount.textContent = String(allChapters.length).padStart(2, "0");

  renderLibrary();
  renderFilters();
  renderChapters();
  updateReadingRoom(activeChapterId);
}

langButtons.forEach((button) => {
  button.addEventListener("click", () => applyLanguage(button.dataset.lang));
});

window.addEventListener("scroll", () => {
  handleHeader();
  handleReveal();
  handleParallax();
});

window.addEventListener("load", () => {
  handleHeader();
  handleReveal();
  handleParallax();
  applyLanguage(currentLang);
});
