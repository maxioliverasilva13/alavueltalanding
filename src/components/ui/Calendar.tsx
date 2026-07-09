"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { colors } from "@/lib/colors";

const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const;
const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
] as const;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toISODateLocal(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function fromISODateLocal(iso?: string) {
  if (!iso) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const da = Number(m[3]);
  const date = new Date(y, mo - 1, da);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== da) return null;
  return date;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getMondayIndex(jsDay: number) {
  return (jsDay + 6) % 7;
}

export type CalendarProps = {
  value?: string;
  onChange?: (value: string) => void;
  minDate?: Date;
  /** Días del mes (1–31) con disponibilidad para reservar. */
  availableDays?: number[];
  loading?: boolean;
  onMonthChange?: (year: number, month: number) => void;
};

export default function Calendar({
  value,
  onChange,
  minDate,
  availableDays,
  loading,
  onMonthChange,
}: CalendarProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const effectiveMinDate = useMemo(() => startOfDay(minDate ?? today), [minDate, today]);
  const selectedDate = useMemo(() => fromISODateLocal(value), [value]);

  const [viewDate, setViewDate] = useState<Date>(selectedDate ?? effectiveMinDate ?? today);

  const monthLabel = `${MONTHS[viewDate.getMonth()]}, ${viewDate.getFullYear()}`;

  const days = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const leadingBlanks = getMondayIndex(first.getDay());
    const totalDaysInMonth = last.getDate();

    const cells: Array<{ date: Date | null; key: string }> = [];
    for (let i = 0; i < leadingBlanks; i++) {
      cells.push({ date: null, key: `blank-${year}-${month}-${i}` });
    }
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const date = new Date(year, month, d);
      cells.push({ date, key: toISODateLocal(date) });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ date: null, key: `blank-tail-${year}-${month}-${cells.length}` });
    }
    return cells;
  }, [viewDate]);

  const goPrevMonth = () => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    setViewDate(newDate);
    onMonthChange?.(newDate.getFullYear(), newDate.getMonth() + 1);
  };

  const goNextMonth = () => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    setViewDate(newDate);
    onMonthChange?.(newDate.getFullYear(), newDate.getMonth() + 1);
  };

  const inCurrentMonth = (d: Date) =>
    d.getFullYear() === viewDate.getFullYear() && d.getMonth() === viewDate.getMonth();

  return (
    <div className="relative flex w-full select-none flex-col gap-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goPrevMonth}
          className="rounded-full p-2 transition-colors hover:bg-gray-100"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="h-6 w-6 text-gray-900" />
        </button>
        <div className="text-lg font-semibold text-gray-900">{monthLabel}</div>
        <button
          type="button"
          onClick={goNextMonth}
          className="rounded-full p-2 transition-colors hover:bg-gray-100"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="h-6 w-6 text-gray-900" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-sm font-semibold text-gray-900">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {days.map(({ date, key }) => {
          if (!date) {
            return <div key={key} className="mx-auto h-10 w-10 sm:h-11 sm:w-11" aria-hidden />;
          }

          const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
          const isToday = isSameDay(date, today);
          const isPast = startOfDay(date).getTime() < effectiveMinDate.getTime();
          const isAvailable =
            !isPast &&
            inCurrentMonth(date) &&
            availableDays != null &&
            availableDays.includes(date.getDate());
          const isBusy =
            !isPast &&
            inCurrentMonth(date) &&
            availableDays != null &&
            !availableDays.includes(date.getDate());
          const isDisabled = isPast || (availableDays != null && !isAvailable);

          let bg = "transparent";
          let border = isToday ? colors.primary : "#E5E7EB";
          let text = "#374151";

          if (isSelected) {
            bg = colors.primary;
            border = colors.primary;
            text = colors.white;
          } else if (isAvailable) {
            bg = "#ecfdf5";
            border = "#6ee7b7";
            text = "#065f46";
          } else if (isBusy) {
            bg = "#fef2f2";
            border = "#fecaca";
            text = "#991b1b";
          }

          return (
            <button
              key={key}
              type="button"
              onClick={() => !isDisabled && onChange?.(toISODateLocal(date))}
              disabled={isDisabled}
              className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#8972FD] sm:h-11 sm:w-11 ${
                isDisabled && !isSelected ? "cursor-not-allowed opacity-35" : "hover:opacity-90"
              }`}
              style={{ backgroundColor: bg, borderColor: border, color: text }}
              aria-label={`Seleccionar ${toISODateLocal(date)}`}
              aria-pressed={isSelected}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border border-emerald-300 bg-emerald-50" />
          Disponible
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border border-red-200 bg-red-50" />
          Ocupado
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full border-2" style={{ borderColor: colors.primary }} />
          Seleccionado
        </span>
      </div>

      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/75">
          <div
            className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300"
            style={{ borderTopColor: colors.primary }}
          />
        </div>
      )}
    </div>
  );
}
