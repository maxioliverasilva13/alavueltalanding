import type { Metadata } from "next";
import type { LandingEmpresaData } from "./types";
import {
  empresaDisplayDescription,
  empresaDisplayTitle,
  empresaLogoPhoto,
} from "./empresa-display";

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
  // Favicon / icono de pestaña: logo o foto de la empresa (no la portada).
  const iconUrl = empresaLogoPhoto(empresa);

  return {
    title: empresaDisplayTitle(empresa),
    description:
      empresaDisplayDescription(empresa) ||
      `Reservá servicios y pedí productos en ${empresa.nombre}`,
    icons: iconUrl
      ? {
          icon: [{ url: iconUrl }],
          apple: [{ url: iconUrl }],
          shortcut: iconUrl,
        }
      : alavueltaIcons,
  };
}
