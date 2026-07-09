export function formatPrice(amount: number, currency: string): string {
  return `${currency} ${Number(amount).toLocaleString("es-UY")}`;
}

export function formatDuration(mins: number): string {
  if (mins === 0) return "—";
  if (mins % 1440 === 0) return `${mins / 1440}d`;
  if (mins % 60 === 0) return `${mins / 60}h`;
  return `${mins}m`;
}
