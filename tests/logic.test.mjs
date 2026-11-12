import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateDateTime,buildMessage,telegramURL,escapePosition,validatePlans} from '../logic.js';
test('rejects empty, malformed, impossible and past dates; accepts future date',()=>{
 const now=new Date(2026,10,12,19,0);
 for(const [d,t] of [['',''],['2026-02-30','19:00'],['2026-11-11','20:00'],['2026-11-12','18:30'],['2026-11-13','25:00']]) assert.ok(validateDateTime(d,t,now));
 assert.equal(validateDateTime('2026-11-13','19:30',now),'');
});
test('message preserves notes and Telegram targets the supplied recipient',()=>{
 const text=buildMessage({date:'2026-11-13',time:'19:30',moods:['Ужин и разговоры','Прогулка'],customPlan:'Зайти за кофе & десертом',notes:'Без рыбы & орехов <3'});
 assert.match(text,/13\.11\.2026/); assert.match(text,/Без рыбы & орехов <3/);
 assert.match(text,/Ужин и разговоры/); assert.match(text,/Прогулка/); assert.match(text,/Зайти за кофе & десертом/);
 const url=new URL(telegramURL(text)); assert.equal(url.pathname,'/Sav1nDm1tr11'); assert.equal(url.searchParams.get('text'),text);
});
test('plans allow several choices or a custom-only plan, but not an empty answer',()=>{
 assert.ok(validatePlans([], '   '));
 assert.equal(validatePlans(['Ужин','Прогулка'], ''),'');
 assert.equal(validatePlans([], 'Посмотреть на Неву'),'');
 const text=buildMessage({date:'2026-11-13',time:'19:30',moods:[],customPlan:'  Мой план  ',notes:''});
 assert.match(text,/План: Мой план\./); assert.doesNotMatch(text,/undefined/);
});
test('escape randomly chooses six positions and never repeats the previous one',()=>{
 const positions=[0,.2,.4,.6,.8,.999].map(random=>escapePosition(320,180,130,50,-1,()=>random));
 assert.equal(new Set(positions.map(p=>`${p.x},${p.y}`)).size,6);
 let previous=0;
 for(let i=0;i<100;i++){
  const p=escapePosition(320,180,130,50,previous,()=>.5);
  assert.notEqual(p.index,previous); previous=p.index;
 }
});
test('escape destination does not stay under the pointer',()=>{
 const pointer={x:100,y:30};
 for(const random of [0,.2,.4,.6,.8,.999]){
  const p=escapePosition(320,180,130,50,-1,()=>random,pointer);
  assert.ok(pointer.x<p.x || pointer.x>p.x+130 || pointer.y<p.y || pointer.y>p.y+50);
 }
});
test('evasive positions remain inside narrow and wide stages',()=>{
 for(const width of [240,320,600]) for(let attempt=0;attempt<100;attempt++){
  const p=escapePosition(width,180,130,50,attempt);
  assert.ok(p.x>=0 && p.x+130<=width); assert.ok(p.y>=0 && p.y+50<=180);
 }
});
