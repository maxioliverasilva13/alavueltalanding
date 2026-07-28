import { Ban, Home, MapPinned, Radius, Store } from "lucide-react";
import type { LandingEmpresaData } from "@/lib/types";
import { colors } from "@/lib/colors";

type Props = {
  empresa: LandingEmpresaData["empresa"];
  zonas?: LandingEmpresaData["zonas_no_trabajo"];
};

function formatKm(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
}

export default function LandingCoverage({ empresa, zonas = [] }: Props) {
  const coverageKm = Number(empresa.rango_mapa_km);
  const radioKm = Number.isFinite(coverageKm) && coverageKm > 0 ? coverageKm : 10;
  const hasModalidad = empresa.trabajo_domicilio || empresa.trabajo_local;
  const activeZones = zonas.filter((z) => Number(z.radio_km) > 0);

  return (
    <section
      id="cobertura"
      className="scroll-mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm"
      style={{ borderColor: colors.border }}
    >
      <div className="border-b px-6 py-5" style={{ borderColor: colors.border }}>
        <div className="flex items-center gap-2">
          <MapPinned className="h-5 w-5" style={{ color: colors.primary }} />
          <h2 className="text-lg font-semibold text-gray-900">Área de trabajo</h2>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Radio de cobertura desde su ubicación
          {activeZones.length > 0 ? " y zonas excluidas" : ""}.
        </p>
      </div>

      <div className="space-y-5 px-6 py-5">
        {hasModalidad && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Modalidad</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {empresa.trabajo_local && (
                <span
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-800"
                  style={{ background: colors.primaryLighter }}
                >
                  <Store className="h-4 w-4" style={{ color: colors.primary }} />
                  Atención en local
                </span>
              )}
              {empresa.trabajo_domicilio && (
                <span
                  className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-800"
                  style={{ background: colors.primaryLighter }}
                >
                  <Home className="h-4 w-4" style={{ color: colors.primary }} />
                  Van a domicilio
                </span>
              )}
            </div>
          </div>
        )}

        <div
          className="flex items-start gap-3 rounded-2xl border p-4"
          style={{ borderColor: colors.border, background: colors.background }}
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
            style={{ background: colors.primaryLighter }}
          >
            <Radius className="h-5 w-5" style={{ color: colors.primary }} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Área de cobertura</p>
            <p className="mt-0.5 text-sm text-gray-600">
              Trabajan en un radio de{" "}
              <span className="font-semibold text-gray-900">{formatKm(radioKm)} km</span> a partir de
              su ubicación.
            </p>
            {empresa.ubicacion && (
              <p className="mt-1 text-xs text-gray-400">Ubicación de referencia: {empresa.ubicacion}</p>
            )}
          </div>
        </div>

        {activeZones.length > 0 && (
          <div>
            <div className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-red-500" />
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Zonas sin cobertura
              </p>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Estas zonas quedan excluidas del área de trabajo.
            </p>
            <ul className="mt-3 space-y-2">
              {activeZones.map((zona) => (
                <li
                  key={zona.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-red-100 bg-red-50/70 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {zona.nombre?.trim() || "Zona sin cobertura"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Radio excluido: {formatKm(Number(zona.radio_km))} km
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-red-600">
                    Excluida
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
