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

export function buildMessage({date, time, mood, notes}) {
  const [y, m, d] = date.split('-');
  return `Ужин согласован. Правок нет 😌\n\nИду с тобой в «Или», Литейный, 53.\nКогда: ${d}.${m}.${y} в ${time} (моё местное время).\nПлан: ${mood}.\n${notes.trim() ? `Пожелания: ${notes.trim()}\n` : ''}\nДавай подтвердим время и столик в чате.`;
}

export function telegramURL(message) {
  return `https://t.me/${recipient}?text=${encodeURIComponent(message)}`;
}

export function escapePosition(width, height, buttonWidth, buttonHeight, attempt) {
  return {x: Math.max(0, width - buttonWidth) * (attempt % 2 ? 0.08 : 0.88), y: Math.max(0, height - buttonHeight) * (attempt % 2 ? 0.9 : 0.8)};
}
