import { MapPin, Star } from "lucide-react";
import type { LandingEmpresaData } from "@/lib/types";
import { colors } from "@/lib/colors";
import {
  empresaCoverPhoto,
  empresaDisplayDescription,
  empresaDisplaySlogan,
  empresaDisplayTitle,
  empresaLogoPhoto,
} from "@/lib/empresa-display";

type Props = {
  empresa: LandingEmpresaData["empresa"];
  showCta?: boolean;
};

export default function LandingHero({ empresa, showCta = true }: Props) {
  const title = empresaDisplayTitle(empresa);
  const slogan = empresaDisplaySlogan(empresa);
  const description = empresaDisplayDescription(empresa);
  const coverPhoto = empresaCoverPhoto(empresa);
  const logo = empresaLogoPhoto(empresa);

  return (
    <section className="relative min-h-[340px] overflow-hidden md:min-h-[400px]">
      {/* Fondo */}
      {coverPhoto ? (
        <img
          src={coverPhoto}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full scale-105 object-cover"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 45%, #4c3d9e 100%)`,
          }}
        />
      )}

      {/* Overlay oscuro + blur (más blur sin foto) */}
      <div
        className={`absolute inset-0 bg-gradient-to-b from-black/75 via-black/50 to-black/30 ${
          coverPhoto ? "backdrop-blur-[3px]" : "backdrop-blur-md"
        }`}
      />

      {/* Brillo sutil arriba */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent" />

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-12 md:py-16">
        <div className="max-w-3xl">
          {logo && (
            <img
              src={logo}
              alt={title}
              className="mb-5 h-16 w-16 object-contain md:h-[72px] md:w-[72px]"
            />
          )}
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-5xl md:leading-tight">
            {title}
          </h1>
          {slogan && (
            <p className="mt-3 text-lg font-medium text-white/90 md:text-xl">{slogan}</p>
          )}
          {description && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">
              {description}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            {empresa.cant_calif > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {empresa.rating.toFixed(1)} · {empresa.cant_calif} reseñas
              </span>
            )}
            {empresa.ubicacion && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-sm text-white/85 backdrop-blur-sm">
                <MapPin className="h-4 w-4 shrink-0 text-white/90" />
                <span className="max-w-[240px] truncate sm:max-w-none">{empresa.ubicacion}</span>
              </span>
            )}
            {empresa.vende_servicios && (
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/80 backdrop-blur-sm">
                Servicios
              </span>
            )}
            {empresa.vende_productos && (
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white/80 backdrop-blur-sm">
                Productos
              </span>
            )}
          </div>

          {showCta && (empresa.vende_servicios || empresa.vende_productos) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {empresa.vende_servicios && (
                <a
                  href="#reservar"
                  className="inline-flex h-11 items-center rounded-xl px-6 text-sm font-semibold text-gray-900 shadow-lg transition hover:scale-[1.02] hover:opacity-95"
                  style={{ background: colors.white }}
                >
                  Reservar servicio
                </a>
              )}
              {empresa.vende_productos && (
                <a
                  href="#productos"
                  className="inline-flex h-11 items-center rounded-xl border border-white/30 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  Ver productos
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
