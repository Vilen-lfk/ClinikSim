/** Бэкенд хранит время в UTC, но SQLite теряет часовой пояс — добавляем "Z", если его нет. */
export function parseServerDate(iso?: string): Date | null {
  if (!iso) return null;
  const hasTz = /([zZ]|[+-]\d{2}:?\d{2})$/.test(iso);
  const d = new Date(hasTz ? iso : `${iso}Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Время в формате ЧЧ:ММ. */
export function formatClock(iso?: string): string {
  const d = parseServerDate(iso);
  return d ? d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }) : "";
}
