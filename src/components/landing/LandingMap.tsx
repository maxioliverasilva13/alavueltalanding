import { MapPin } from "lucide-react";
import type { LandingEmpresaData } from "@/lib/types";
import { colors } from "@/lib/colors";

type Props = {
  empresa: LandingEmpresaData["empresa"];
};

export default function LandingMap({ empresa }: Props) {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token || !empresa.compartir_ubicacion_mapa) return null;

  const lat = empresa.latitud!;
  const lng = empresa.longitud!;
  const mapUrl =
    `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/` +
    `pin-s+8972FD(${lng},${lat})/${lng},${lat},14,0/640x280@2x` +
    `?access_token=${token}`;

  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <section className="overflow-hidden rounded-2xl border bg-white shadow-sm" style={{ borderColor: colors.border }}>
      <div className="border-b px-6 py-4" style={{ borderColor: colors.border }}>
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5" style={{ color: colors.primary }} />
          <h2 className="text-lg font-semibold text-gray-900">Ubicación</h2>
        </div>
        {empresa.ubicacion && (
          <p className="mt-1 text-sm text-gray-600">{empresa.ubicacion}</p>
        )}
      </div>
      <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="block">
        <img
          src={mapUrl}
          alt={`Mapa de ${empresa.ubicacion || empresa.nombre}`}
          className="h-56 w-full object-cover transition hover:opacity-95"
        />
      </a>
    </section>
  );
}
