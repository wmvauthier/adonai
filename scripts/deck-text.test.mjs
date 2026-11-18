import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import '../shared/deck-text.js';
const read = path => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const sets = new Map(read('../data/refs/collections.json').collections.map(x=>[x.id,x.code]));
const types = new Map(read('../data/refs/types.json').types.map(x=>[x.id,x.code]));
const cards = new Map(read('../data/game/cards.json').cards.map(x=>[`${sets.get(x.collection)}-${types.get(x.type[0])}-${x.number}`,x]));
const virtues = read('../data/game/virtues.json').virtues;
const decks = read('../data/game/decks.json').decks;
const {importText,exportText} = globalThis.AdonaiDeckText;
test('todos os decks fazem ida e volta com 14 virtudes extras',()=>{
 for(const deck of decks){
 const ids=[...deck.identity.champions,...deck.identity.temples,...deck.identity.territories,...deck.cards];
 const txt=exportText(ids,cards,virtues);
 assert.equal(txt.split('\n').at(-1),'Sideboard:');
 const parsed=importText(txt,cards,virtues);
 assert.deepEqual(parsed.errors,[]);
 assert.deepEqual(parsed.ids,ids);
 assert.equal(parsed.ignoredVirtues,14);
 }
});
test('aceita nomes sem acentos e não mistura sideboard colado com principal',()=>{
 const parsed=importText('1 fe\n1 Duvida\n1 Davi, Segundo o Coracao de Deus\nSideboard:1 Arca da Aliança\n1 Palácio de Cedro',cards,virtues);
 assert.deepEqual(parsed.errors,[]);assert.equal(parsed.ids.length,1);assert.equal(parsed.ignoredVirtues,2);assert.equal(parsed.sideboard,2);
});
test('mantém IDs antigos, recusa cartas desconhecidas, quantidades e nomes ambíguos',()=>{
 assert.deepEqual(importText('- [TEC-CMP-001] Davi',cards,virtues).ids,['TEC-CMP-001']);
 for(const txt of ['2 Arca da Aliança','1 inexistente','0 Fé','1 Arca da Aliança\n1 Arca da Aliança'])assert.ok(importText(txt,cards,virtues).errors.length);
 const duplicate=new Map(cards);duplicate.set('OTHER-ART-001',cards.get('TEC-ART-041'));
 assert.ok(importText('1 Arca da Aliança',duplicate,virtues).errors.length);
});
