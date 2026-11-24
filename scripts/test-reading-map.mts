// Reading map logic tests. Run: node scripts/test-reading-map.mts  (Node 22.6+; no Jest needed)
import assert from 'node:assert/strict';
import * as RM from '../lib/reading-map.ts';
const P = RM.tokenizePassage('Ravi went to the market. He bought fresh vegetables, and walked through the busy street.');
const S = (pairs: [string, number, number?][]) => pairs.map(([norm, t, confidence]) => ({ norm, t, confidence }));
let n=0; const t=(name: string, f: ()=>void)=>{ f(); n++; console.log('ok -', name); };

t('perfect reading is all fluent', () => {
  const words = P.map((p,i)=>[p.norm, i*400] as [string,number]);
  const m = RM.buildReadingMap(P, S(words));
  assert.equal(m.summary.counts.fluent, P.length); assert.equal(m.summary.accuracyPct, 100);
  assert.deepEqual(m.summary.trickyWords, []); assert.ok(m.summary.wpm! > 100);
});
t('pause before a word = hesitated; pause after full stop is natural', () => {
  const ts=[0,400,800,1200,1600, /*He after full stop*/ 4000, 4400, /*fresh*/ 6400, 6800];
  const words = P.slice(0,9).map((p,i)=>[p.norm, ts[i]] as [string,number]);
  const m = RM.buildReadingMap(P, S(words));
  assert.equal(m.words[5].status, 'fluent', 'He: after full stop');
  assert.equal(m.words[7].status, 'hesitated', 'fresh');
  assert.ok(m.summary.trickyWords.includes('fresh'));
});
t('Stage 1–2 get a longer allowance', () => {
  const words: [string,number][] = [['ravi',0],['went',400],['to',2400],['the',2800]];
  assert.equal(RM.buildReadingMap(P, S(words), {stage:3}).words[2].status, 'hesitated');
  assert.equal(RM.buildReadingMap(P, S(words), {stage:2}).words[2].status, 'fluent');
});
t('misread word', () => {
  const words: [string,number][] = [['ravi',0],['want',400],['to',800],['the',1200],['market',1600]];
  const m = RM.buildReadingMap(P, S(words));
  assert.equal(m.words[1].status, 'misread'); assert.equal(m.words[1].spoken, 'want');
  assert.equal(m.words[2].status, 'fluent');
});
t('skipped word', () => {
  const words: [string,number][] = [['ravi',0],['went',400],['the',800],['market',1200]];
  const m = RM.buildReadingMap(P, S(words));
  assert.equal(m.words[2].status, 'skipped'); assert.equal(m.words[3].status, 'fluent');
});
t('self-correction gets credit', () => {
  const words: [string,number][] = [['ravi',0],['want',400],['went',800],['to',1200]];
  const m = RM.buildReadingMap(P, S(words));
  assert.equal(m.words[1].status, 'selfCorrected'); assert.equal(m.words[1].spoken, 'want');
  assert.equal(m.summary.counts.misread, 0);
});
t('accent pair (v/w) is unclear, not an error', () => {
  const Q = RM.tokenizePassage('He bought very fresh vegetables.');
  const m = RM.buildReadingMap(Q, S([['he',0],['bought',400],['wery',800],['fresh',1200],['vegetables',1600]]));
  assert.equal(m.words[2].status, 'unclear'); assert.equal(m.summary.accuracyPct, 100);
});
t('low-confidence non-match is unclear, not misread', () => {
  const m = RM.buildReadingMap(P, S([['ravi',0],['vent',400,0.2],['to',800]]));
  assert.equal(m.words[1].status, 'unclear');
});
t('long-word recogniser ending (vegetable/vegetables) not an error', () => {
  const Q = RM.tokenizePassage('fresh vegetables today');
  const m = RM.buildReadingMap(Q, S([['fresh',0],['vegetable',400],['today',800]]));
  assert.equal(m.words[1].status, 'fluent');
});
t('stopped halfway: unread words not counted as errors', () => {
  const words = P.slice(0,5).map((p,i)=>[p.norm, i*400] as [string,number]);
  const m = RM.buildReadingMap(P, S(words));
  assert.equal(m.summary.lastReadIndex, 4); assert.equal(m.summary.counts.skipped, 0); assert.equal(m.summary.accuracyPct, 100);
});
t('noisy room flagged', () => {
  const words = P.map((p,i)=>[i%2? 'zzq'+i : p.norm, i*400, i%2?0.1:0.9] as [string,number,number]);
  assert.equal(RM.buildReadingMap(P, S(words)).summary.noisy, true);
});
t('stamina drop measured', () => {
  const long = RM.tokenizePassage(Array.from({length:30},(_,i)=>'word'+i).join(' '));
  let tt=0; const words = long.map((p,i)=>{ tt += i<15?300:900; return [p.norm, tt] as [string,number]; });
  const m = RM.buildReadingMap(long, S(words));
  assert.ok((m.summary.stamina.dropPct ?? 0) > 40, String(m.summary.stamina.dropPct));
});
t('timeline keeps first-seen times through interim revisions', () => {
  let tl = RM.updateSpokenTimeline([], 'ravi want', 100);
  tl = RM.updateSpokenTimeline(tl, 'ravi went to', 600);
  assert.deepEqual(tl.map(w=>[w.norm,w.t]), [['ravi',100],['went',100],['to',600]]);
});
t('class most-missed', () => {
  const a = RM.buildReadingMap(P, S([['ravi',0],['went',400],['to',800],['the',1200],['mark',1600],['he',2000]]));
  const b = RM.buildReadingMap(P, S([['ravi',0],['went',400],['to',800],['the',1200],['makes',1600],['he',2000]]));
  assert.deepEqual(RM.mostMissed([a,b], P)[0], {word:'market', readers:2});
});
console.log(`\n${n} tests passed`);
