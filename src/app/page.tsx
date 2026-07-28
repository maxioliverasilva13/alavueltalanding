import type { Metadata } from "next";
import { headers } from "next/headers";
import { getLandingData } from "@/lib/api";
import NotFound from "@/components/NotFound";
import LandingHero from "@/components/landing/LandingHero";
import LandingTopBar from "@/components/landing/LandingTopBar";
import LandingSchedule from "@/components/landing/LandingSchedule";
import LandingMap from "@/components/landing/LandingMap";
import LandingProfessions from "@/components/landing/LandingProfessions";
import LandingBooking from "@/components/landing/LandingBooking";
import LandingCoverage from "@/components/landing/LandingCoverage";
import { colors } from "@/lib/colors";
import { empresaHasMap } from "@/lib/empresa-display";
import { alavueltaIcons, empresaMetadata, loadingMetadata } from "@/lib/metadata";

async function resolveSubdomain() {
  const h = await headers();
  return h.get("x-subdomain") || process.env.NEXT_PUBLIC_DEFAULT_SUBDOMAIN || null;
}

export async function generateMetadata(): Promise<Metadata> {
  const subdomain = await resolveSubdomain();
  if (!subdomain) {
    return { ...loadingMetadata, title: "Página no encontrada", icons: alavueltaIcons };
  }

  const data = await getLandingData(subdomain);
  if (!data) {
    return { ...loadingMetadata, title: "Empresa no encontrada", icons: alavueltaIcons };
  }

  return empresaMetadata(data);
}

export default async function HomePage() {
  const subdomain = await resolveSubdomain();

  if (!subdomain) {
    return <NotFound />;
  }

  const data = await getLandingData(subdomain);

  if (!data) {
    return (
      <NotFound
        title="Empresa no encontrada"
        description="Esta empresa no existe o no tiene una landing activa. Verificá el enlace con quien te lo compartió."
      />
    );
  }

  const { empresa, horarios, profesiones, zonas_no_trabajo } = data;
  const showMap = empresaHasMap(empresa);

  return (
    <main className="min-h-screen" style={{ background: colors.background }}>
      <div className="relative">
        <LandingTopBar />
        <LandingHero empresa={empresa} />
      </div>

      <div className="mx-auto max-w-5xl space-y-10 px-4 py-10">
        {empresa.vende_servicios && profesiones.length > 0 && (
          <LandingProfessions profesiones={profesiones} />
        )}

        <LandingBooking data={data} />

        <section className="space-y-6 pt-4">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">Información</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">Ubicación y horarios</h2>
          </div>

          {showMap && <LandingMap empresa={empresa} />}
          {horarios.length > 0 && <LandingSchedule horarios={horarios} />}
        </section>

        <LandingCoverage empresa={empresa} zonas={zonas_no_trabajo} />
      </div>

      <footer className="mt-4 border-t py-10 text-center text-xs text-gray-400" style={{ borderColor: colors.border }}>
        <p>© {new Date().getFullYear()} {empresa.nombre}</p>
        <p className="mt-1 opacity-70">Powered by Fixeo</p>
      </footer>
    </main>
  );
}
