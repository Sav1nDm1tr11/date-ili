import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateDateTime,buildMessage,telegramURL,escapePosition} from '../logic.js';
test('rejects empty, malformed, impossible and past dates; accepts future date',()=>{
 const now=new Date(2026,10,12,19,0);
 for(const [d,t] of [['',''],['2026-02-30','19:00'],['2026-11-11','20:00'],['2026-11-12','18:30'],['2026-11-13','25:00']]) assert.ok(validateDateTime(d,t,now));
 assert.equal(validateDateTime('2026-11-13','19:30',now),'');
});
test('message preserves notes and Telegram targets the supplied recipient',()=>{
 const text=buildMessage({date:'2026-11-13',time:'19:30',mood:'Сначала ужин, потом приключения',notes:'Без рыбы & орехов <3'});
 assert.match(text,/13\.11\.2026/); assert.match(text,/Без рыбы & орехов <3/);
 const url=new URL(telegramURL(text)); assert.equal(url.pathname,'/Sav1nDm1tr11'); assert.equal(url.searchParams.get('text'),text);
});
test('evasive positions remain inside narrow and wide stages',()=>{
 for(const width of [240,320,600]) for(let attempt=0;attempt<100;attempt++){
  const p=escapePosition(width,180,130,50,attempt);
  assert.ok(p.x>=0 && p.x+130<=width); assert.ok(p.y>=0 && p.y+50<=180);
 }
});
