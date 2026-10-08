import type { SessionListItem } from "../types";

/**
 * Считает текущую серию дней подряд с хотя бы одной сессией (любого статуса),
 * отсчитывая от сегодняшнего или вчерашнего дня назад без пропусков.
 * Если сегодня сессий ещё не было, но вчера серия продолжалась — она не обнуляется,
 * чтобы не наказывать студента до конца текущего дня.
 */
export function calcStreak(sessions: SessionListItem[]): number {
  if (sessions.length === 0) return 0;

  const dayKeys = new Set(
    sessions.map((s) => {
      const d = new Date(s.created_at);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    }),
  );

  const cursor = new Date();
  const todayKey = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
  if (!dayKeys.has(todayKey)) {
    cursor.setDate(cursor.getDate() - 1); // сегодня ещё не занимались — начинаем проверку со вчера
  }

  let streak = 0;
  while (true) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
    if (!dayKeys.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}