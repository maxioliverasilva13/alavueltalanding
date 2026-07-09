const DAY_LABELS: Record<string, string> = {
  "1": "Lunes",
  "2": "Martes",
  "3": "Miércoles",
  "4": "Jueves",
  "5": "Viernes",
  "6": "Sábado",
  "7": "Domingo",
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

export function formatDiaSemana(dia: string): string {
  const key = dia.toLowerCase();
  return DAY_LABELS[key] ?? DAY_LABELS[String(Number(dia))] ?? dia;
}

export function formatHora(hora: string): string {
  return hora.slice(0, 5);
}

/** Convierte Date.getDay() (0=Dom) al formato del backend (1=Lun … 7=Dom). */
export function jsDayToBackendDay(date: Date): string {
  const d = date.getDay();
  return d === 0 ? "7" : String(d);
}

/** Genera slots de 30 min entre hora_inicio y hora_fin para reservas. */
export function buildHourSlots(horaInicio: string, horaFin: string): string[] {
  const [sh, sm] = horaInicio.slice(0, 5).split(":").map(Number);
  const [eh, em] = horaFin.slice(0, 5).split(":").map(Number);
  let start = sh * 60 + sm;
  const end = eh * 60 + em;
  const slots: string[] = [];

  while (start < end) {
    const h = Math.floor(start / 60);
    const m = start % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    start += 30;
  }
  return slots;
}
