export const recipient = 'Sav1nDm1tr11';
export const mapURL = 'https://yandex.ru/maps/org/ili/26016389944/';

export function validateDateTime(date, time, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) return 'Выбери дату и время — спонтанность оставим на десерт.';
  const [y, m, d] = date.split('-').map(Number);
  const [h, min] = time.split(':').map(Number);
  const selected = new Date(y, m - 1, d, h, min);
  if (selected.getFullYear() !== y || selected.getMonth() !== m - 1 || selected.getDate() !== d || h > 23 || min > 59) return 'Кажется, такой даты или времени нет. Попробуем ещё раз?';
  if (selected <= now) return 'В прошлое пока не умеем. Выбери вечер впереди.';
  return '';
}

export function validatePlans(moods, customPlan) {
  return moods.length || customPlan.trim() ? '' : 'Выбери хотя бы один план или предложи свой.';
}

export function buildMessage({date, time, moods, customPlan, notes}) {
  const [y, m, d] = date.split('-');
  const plans=[...moods,customPlan.trim()].filter(Boolean).join(' + ');
  return `Ужин согласован. Правок нет 😌\n\nИду с тобой в «Или», Литейный, 53.\nКогда: ${d}.${m}.${y} в ${time} (моё местное время).\nПлан: ${plans}.\n${notes.trim() ? `Пожелания: ${notes.trim()}\n` : ''}\nДавай подтвердим время и столик в чате.`;
}

export function telegramURL(message) {
  return `https://t.me/${recipient}?text=${encodeURIComponent(message)}`;
}

export function escapePosition(width, height, buttonWidth, buttonHeight, previous=-1, random=Math.random, pointer=null) {
  const positions=[[0,0],[.5,0],[1,0],[0,1],[.5,1],[1,1]].map(([x,y],index)=>({x:x*Math.max(0,width-buttonWidth),y:y*Math.max(0,height-buttonHeight),index}));
  const candidates=positions.filter(p=>p.index!==previous && (!pointer || pointer.x<p.x || pointer.x>p.x+buttonWidth || pointer.y<p.y || pointer.y>p.y+buttonHeight));
  const available=candidates.length ? candidates : positions.filter(p=>p.index!==previous);
  return available[Math.floor(random()*available.length)];
}
