export const DIA_LABELS: Record<number, string> = {
  1: "Lun",
  2: "Mar",
  3: "Mié",
  4: "Jue",
  5: "Vie",
  6: "Sáb",
  7: "Dom",
};

export const DIA_FULL: Record<number, string> = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
  7: "Domingo",
};

export const todayDiaSemana = () => {
  const d = new Date().getDay();
  return d === 0 ? 7 : d;
};

export const isoWeekday = (d: Date) => {
  const day = d.getDay();
  return day === 0 ? 7 : day;
};

export const toIsoDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const parseIsoDate = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const upcomingDatesForDias = (dias: number[], count = 6): string[] => {
  if (!dias.length) return [];
  const set = new Set(dias);
  const out: string[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  for (let i = 0; i < 90 && out.length < count; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    if (set.has(isoWeekday(d))) out.push(toIsoDate(d));
  }
  return out;
};

export const formatMenuDateLabel = (iso: string) => {
  const d = parseIsoDate(iso);
  return `${DIA_FULL[isoWeekday(d)]} ${d.getDate()}/${d.getMonth() + 1}`;
};
