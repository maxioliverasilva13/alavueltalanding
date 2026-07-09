import type { Metadata } from "next";
import type { LandingEmpresaData } from "./types";
import { empresaDisplayTitle, empresaDisplayDescription } from "./empresa-display";

export const alavueltaIcons: Metadata["icons"] = {
  icon: [
    { url: "/icons/icon-48.webp", sizes: "48x48", type: "image/webp" },
    { url: "/icons/icon-192.webp", sizes: "192x192", type: "image/webp" },
  ],
  apple: [{ url: "/icons/icon-192.webp" }],
};

export const loadingMetadata: Metadata = {
  title: "Loading",
  description: "Reservá servicios y pedí productos",
  icons: alavueltaIcons,
};

export function empresaMetadata(data: LandingEmpresaData): Metadata {
  const { empresa } = data;
  const iconUrl =
    empresa.landing_foto_url?.trim() ||
    empresa.rounded_foto_url ||
    empresa.foto_url;

  return {
    title: empresaDisplayTitle(empresa),
    description:
      empresaDisplayDescription(empresa) ||
      `Reservá servicios y pedí productos en ${empresa.nombre}`,
    icons: iconUrl
      ? {
          icon: [{ url: iconUrl }],
          apple: [{ url: iconUrl }],
        }
      : alavueltaIcons,
  };
}
