import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { sectionExamples } from './rules-examples.mjs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = new URL('../', import.meta.url);
const rules = readFileSync(new URL('data/rules/comprehensive_rules.md', root), 'utf8');
const cards = JSON.parse(readFileSync(new URL('data/game/cards.json', root))).cards;
const dir = mkdtempSync(join(tmpdir(),'adonai-rules-'));
process.on('exit', () => rmSync(dir, {recursive:true, force:true}));
const images = new Map();
function asset(path) {
  if (!images.has(path)) {
    const source = fileURLToPath(new URL(path.replace(/^\.\.\//, ''), root));
    const target = join(dir, 'art-' + images.size + '.jpg');
    const width = path.includes('/imgs/') ? 1400 : 620;
    execFileSync('ffmpeg', ['-loglevel','error','-i',source,'-vf',`scale='min(iw,${width})':-2`, '-frames:v','1','-q:v','3',target]);
    images.set(path, pathToFileURL(target).href);
  }
  return images.get(path);
}
const inline = text => text.replaceAll('&','&amp;').replaceAll('<','&lt;').replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
const contents = [];
const body = [];
const extras = JSON.parse(readFileSync(new URL('data/game/card-extras.json', root)));
const gold = extras.tokens.find(token => token.id === 'ouro');
const goldImage = gold.art.find(art => art.collectionId === 2).image;
function card(collection, number) {
  const entry = cards.find(item => item.collection === collection && item.number === number);
  return { name: entry.name.pt, image: entry.images.card };
}
const examples = {
  '8.1': {
    title: 'Quanto dano Samuel causa?',
    cards: [card(1, '014')],
    steps: ['Samuel tem Poder 0 e Resistência 1. Ele pode bloquear normalmente.', 'Se bloquear um atacante e seu Poder continuar em 0, Samuel causa 0 de dano de combate.'],
    rule: '8.1.3–8.1.4'
  },
  '9.2': {
    title: 'Pagando para jogar Golias',
    cards: [card(1, '024'), card(1, '011')],
    steps: ['Com o Escudeiro preparado, desprepará-lo paga o custo de sua habilidade. Ela gera duas Essências com restrição de uso.', 'Golias tem Poder 8. As duas Essências podem pagar parte do seu custo 6. Sem modificadores, faltam quatro.'],
    rule: '9.2–9.5'
  },
  '13.1': {
    title: 'Quem recebe a cura?',
    cards: [card(1, '016')],
    steps: ['Davi entra em campo. Para sua habilidade de ENTRADA, você escolhe até dois Guerreiros que controla.', 'Se escolher dois Guerreiros feridos e ambos continuarem como alvos válidos, cada um cura 1 de dano.'],
    rule: '13.1.3 e 13.4'
  },
  '16.6': {
    title: 'Uma ficha na mesa do rei',
    cards: [card(2, '022'), { name: 'Ficha de Ouro', image: goldImage }],
    steps: ['Mefibosete entra em campo e sua habilidade de ENTRADA desencadeia.', 'Quando a habilidade resolve, coloque a ficha de Ouro em campo sob seu controle, já despreparada.'],
    rule: '16.6'
  }
};
function illustratedExample(example) {
  const pictures = example.cards.map(item => `<figure><img src="${asset(item.image)}"><figcaption>${inline(item.name)}</figcaption></figure>`).join('');
  return `<aside><small>EXEMPLO DE PARTIDA</small><h3>${example.title}</h3><div class="spread"><div class="pictures">${pictures}</div><div>${example.steps.map(step => '<p>'+inline(step)+'</p>').join('')}<footer>Regras ${example.rule}</footer></div></div></aside>`;
}
const pendingSections = new Set(Object.keys(sectionExamples));
for (const key of Object.keys(examples)) pendingSections.add(key);
let section;
function finishSection() {
  if (!pendingSections.delete(section)) return;
  if (examples[section]) {
    body.push(illustratedExample(examples[section]));
    return;
  }
  const [title, situation, art] = sectionExamples[section];
  if (art) {
    const entry = cards.find(c => c.images.card.endsWith('/' + art + '.webp'));
    if (!entry) throw Error('Imagem de exemplo desconhecida: ' + art);
    body.push(illustratedExample({ title, cards: [card(entry.collection, entry.number)], steps: [situation], rule: section }));
  } else {
    body.push(`<aside class="compact"><small>EXEMPLO DE PARTIDA · ${section}</small><h3>${inline(title)}</h3><p>${inline(situation)}</p></aside>`);
  }
}
for (const line of rules.split(/\r?\n/)) {
  if (!line.trim() || line === '---' || line.startsWith('# Comprehensive')) continue;
  const chapter = line.match(/^#{1,2} (\d+)\. (.+)/);
  if (line.startsWith('#')) {
    finishSection();
    section = line.match(/^#+ (\d+\.\d+)\./)?.[1];
  }
  if (chapter) {
    const [, number, title] = chapter;
    contents.push(`<a href="#ch${number}">${number}. ${inline(title)}</a>`);
    body.push(`<h2 id="ch${number}">${number}. ${inline(title)}</h2>`);
  } else if (line.startsWith('#')) body.push('<h3>'+inline(line.replace(/^#+ /,''))+'</h3>');
  else body.push('<p>'+inline(line.replace(/^- /,'• '))+'</p>');
}
finishSection();
if (pendingSections.size) throw Error('Seções ausentes: ' + [...pendingSections].join(', '));
const html = `<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Adonai — Regras completas</title><style>
@page{size:A4;margin:18mm;@bottom-right{content:counter(page);font:10pt Georgia;color:#705729}}
*{box-sizing:border-box}body{margin:0;color:#26231d;font:11pt/1.45 Georgia,serif}h1,h2,h3{line-height:1.15}h2,nav{break-before:page}h2{border-top:3px solid #a48040;padding-top:6mm;font-size:26pt}h3{color:#775824}h2,h3{break-after:avoid}p{margin:0 0 2.5mm}header{background:#171614;color:#f0dcac;padding:12mm}header img{width:100%;height:140mm;object-fit:cover}h1{font-size:42pt;margin:8mm 0}nav a{display:block;color:#59421e;margin:1mm}figure{break-before:page;margin:0}figure img{width:72mm;float:left;margin-right:9mm}small{letter-spacing:.16em}</style>
<style>
aside{background:#f5f1e8;border-left:1.2mm solid #a48040;padding:6mm;margin:0 0 8mm;break-inside:avoid}
aside small,aside footer,figcaption{font:9pt/1.35 sans-serif;color:#614c29}aside small{letter-spacing:.12em}
aside h3{font-size:20pt;margin:2mm 0 5mm;color:#312b20}.spread,.pictures{display:flex;gap:5mm;align-items:center}
.pictures{gap:2mm;flex:none}aside figure{width:38mm;margin:0;break-before:auto}aside figure:only-child{width:46mm}
aside figure img{float:none;width:100%;height:auto;margin:0;display:block}figcaption{margin-top:1.5mm}aside footer{margin-top:4mm}
.compact{padding:3mm 5mm;margin:3mm 0 5mm}.compact h3{font-size:14pt;margin:1mm 0}.compact p{margin:0}
</style>
<header><img src="${asset(cards.find(c=>c.collection===2 && c.number==='004').images.art)}"><small>ADONAI CARD GAME</small><h1>Regras completas</h1>${inline(rules.match(/\*\*Versão corrigida:\*\*[^\n]+/)[0])}</header>
<nav><h1>Sumário</h1>${contents.join('')}</nav>
${body.join('\n')}</html>`;
const page = join(dir,'rules.html');
writeFileSync(page,html);
const output = fileURLToPath(new URL('manual/regras-adonai.pdf',root));
const binary = process.env.CHROMIUM || 'chromium';
if (process.argv.includes('--playwright')) {
  const { chromium } = createRequire(import.meta.url)('playwright-core');
  const browser = await chromium.launch({ executablePath: binary });
  try {
    const tab = await browser.newPage();
    await tab.goto(pathToFileURL(page).href);
    await tab.locator('img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
    await tab.pdf({ path: output, preferCSSPageSize: true, printBackground: true });
  } finally {
    await browser.close();
  }
} else {
  execFileSync(binary,['--headless','--no-first-run','--no-sandbox','--disable-gpu','--no-pdf-header-footer','--user-data-dir='+join(dir,'profile'),'--print-to-pdf='+output,pathToFileURL(page).href]);
}
