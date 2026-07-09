import { Clock } from "lucide-react";
import type { LandingEmpresaData } from "@/lib/types";
import { colors } from "@/lib/colors";
import { formatDiaSemana, formatHora } from "@/lib/horarios";

const SHORT_DAYS: Record<string, string> = {
  "1": "Lun",
  "2": "Mar",
  "3": "Mié",
  "4": "Jue",
  "5": "Vie",
  "6": "Sáb",
  "7": "Dom",
};

type Props = {
  horarios: LandingEmpresaData["horarios"];
};

export default function LandingSchedule({ horarios }: Props) {
  if (!horarios.length) return null;

  return (
    <section className="overflow-hidden rounded-2xl border bg-white shadow-sm" style={{ borderColor: colors.border }}>
      <div className="border-b px-6 py-5" style={{ borderColor: colors.border }}>
        <div className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ background: colors.primaryLighter }}
          >
            <Clock className="h-4 w-4" style={{ color: colors.primary }} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Horarios de atención</h2>
            <p className="text-sm text-gray-500">Consultá nuestros días y horarios disponibles</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {horarios.map((h, i) => (
          <div
            key={`${h.dia_semana}-${i}`}
            className="rounded-xl border px-4 py-3.5 transition hover:shadow-sm"
            style={{ borderColor: colors.border, background: "#FAFAFC" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {SHORT_DAYS[h.dia_semana] ?? formatDiaSemana(h.dia_semana).slice(0, 3)}
            </p>
            <p className="mt-1 text-sm font-semibold text-gray-900">{formatDiaSemana(h.dia_semana)}</p>
            <p className="mt-2 tabular-nums text-sm font-medium" style={{ color: colors.primaryDark }}>
              {formatHora(h.hora_inicio)} – {formatHora(h.hora_fin)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
