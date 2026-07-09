import type { LandingEmpresaData } from "@/lib/types";
import { colors } from "@/lib/colors";

type Props = {
  profesiones: LandingEmpresaData["profesiones"];
};

export default function LandingProfessions({ profesiones }: Props) {
  if (!profesiones.length) return null;

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-sm" style={{ borderColor: colors.border }}>
      <h2 className="text-lg font-semibold text-gray-900">Profesiones y especialidades</h2>
      <p className="mt-1 text-sm text-gray-500">Áreas de trabajo que ofrecemos</p>
      <div className="mt-5 flex flex-wrap gap-3">
        {profesiones.map((p) => (
          <div
            key={p.id}
            className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5"
            style={{ borderColor: colors.border, background: colors.primaryLighter }}
          >
            {p.logo_svg_url ? (
              <img src={p.logo_svg_url} alt="" className="h-6 w-6 object-contain" />
            ) : (
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: colors.primary }}
              >
                {p.nombre.charAt(0)}
              </span>
            )}
            <span className="text-sm font-medium text-gray-800">{p.nombre}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
