import {validateDateTime,buildMessage,telegramURL,escapePosition,validatePlans} from './logic.js';

const $ = s => document.querySelector(s);
const dialog = $('#rsvp');
const form = $('#date-form');
const steps = [...document.querySelectorAll('.step')];
let step = 0;
let opener;
let draft = '';
let attempts = 0;
let lastEscape = 0;
let lastPosition = 0;
let toastTimer;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function showStep(index) {
  step = index;
  steps.forEach((el,i) => { el.hidden = i !== index; });
  $('#step-label').textContent = `СВИДАНИЕ / ШАГ 0${index+1} ИЗ 03`;
  document.querySelectorAll('.progress i').forEach((el,i) => el.classList.toggle('active',i <= index));
  const title=steps[index].querySelector('h2');
  steps.forEach(el=>el.querySelector('h2').removeAttribute('id'));
  title.id='step-title';
  dialog.setAttribute('aria-labelledby','step-title');
  dialog.scrollTop = 0;
  title.focus();
}

function openForm() {
  opener=document.activeElement;
  form.hidden=false;
  $('#declined').hidden=true;
  $('.progress').hidden=false;
  dialog.showModal();
  showStep(step);
}
$('#yes').addEventListener('click',openForm);
$('#close').addEventListener('click',()=>dialog.close());
$('#decline-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>opener?.focus());
dialog.addEventListener('click',e=>{
  const r=dialog.getBoundingClientRect();
  if(e.target===dialog && (e.clientX<r.left || e.clientX>r.right || e.clientY<r.top || e.clientY>r.bottom)) dialog.close();
});

function decline() {
  opener=document.activeElement;
  form.hidden=true;
  $('.progress').hidden=true;
  $('#declined').hidden=false;
  $('#step-label').textContent='ТВОЙ ОТВЕТ ВАЖНЕЕ ШУТКИ';
  const title=$('#declined h2'); title.id='decline-title';
  dialog.setAttribute('aria-labelledby','decline-title');
  dialog.showModal(); title.focus();
}
$('#decline').addEventListener('click',decline);
const no=$('#no');
function evade(event) {
  if(reducedMotion.matches || event.detail===0 && event.type==='click') return false;
  if(performance.now()-lastEscape<350) return true;
  lastEscape=performance.now();
  const stage=$('#escape-stage');
  const rect=stage.getBoundingClientRect();
  const pointer={x:event.clientX-rect.left,y:event.clientY-rect.top};
  const pos=escapePosition(stage.clientWidth,stage.clientHeight,no.offsetWidth,no.offsetHeight,lastPosition,Math.random,pointer);
  lastPosition=pos.index;
  no.style.left=`${pos.x}px`; no.style.top=`${pos.y}px`;
  $('#joke').textContent=['404: отказ временно переехал.','Это не баг. Это флирт.','Кнопка попросила ещё один раунд правок.','Отрицательный ответ не прошёл арт-дирекшн.','Кнопка в потоке. Не отвлекаем.','Кажется, у нас бесконечный прототип.'][attempts%6];
  $('#toast').textContent=['Кнопка вышла из зоны комфорта ↗','Новый фрейм. Старые чувства.','Ctrl + Z? Тут не работает.','Этот пиксель тебе не поймать.','Кнопка на удалёнке. Очень удалённо.','Бесконечный скролл? Бесконечный «нет».'][attempts%6];
  $('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),2600);
  attempts++;
  return true;
}
no.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse') evade(event);});
no.addEventListener('click',event=>{if(!evade(event)) decline();});
window.addEventListener('resize',()=>{no.style.left='0px';no.style.top='0px';lastPosition=0;});

const now=new Date();
$('#date').min=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
function advance() {
  if(step===0){
    const error=validateDateTime($('#date').value,$('#time').value);
    $('#date-error').textContent=error;
    const dateInput=$('#date'), timeInput=$('#time');
    const invalid=(!dateInput.value || dateInput.value<dateInput.min) ? dateInput : timeInput;
    for(const input of [dateInput,timeInput]){
      input.setAttribute('aria-invalid',String(Boolean(error)&&input===invalid));
      input.setAttribute('aria-describedby','date-error');
    }
    if(error){invalid.focus();return;}
  }
  if(step===1){
    const error=validateDateTime($('#date').value,$('#time').value);
    if(error){showStep(0);$('#date-error').textContent=error;return;}
    const data=new FormData(form);
    const moods=data.getAll('mood');
    const customPlan=data.get('customPlan');
    const planError=validatePlans(moods,customPlan);
    $('#plan-error').textContent=planError;
    $('#custom-plan').setAttribute('aria-invalid',String(Boolean(planError)));
    if(planError){$('#custom-plan').focus();return;}
    draft=buildMessage({...Object.fromEntries(data),moods,customPlan});
    $('#summary').textContent=draft;
    $('#telegram').href=telegramURL(draft);
    $('#copy-status').textContent='';
  }
  if(step<2) showStep(step+1);
}
document.querySelectorAll('.next').forEach(b=>b.addEventListener('click',advance));
document.querySelectorAll('.back').forEach(b=>b.addEventListener('click',()=>showStep(step-1)));
form.addEventListener('submit',event=>{event.preventDefault();advance();});
$('#copy').addEventListener('click',async()=>{
  try{
    await navigator.clipboard.writeText(draft);
    $('#copy-status').textContent='Скопировано. Можно вставить в наш чат.';
  }catch{
    $('#copy-status').textContent='Автокопирование недоступно. Выдели текст ответа выше и скопируй его вручную.';
    const range=document.createRange();range.selectNodeContents($('#summary'));
    const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);
  }
});
