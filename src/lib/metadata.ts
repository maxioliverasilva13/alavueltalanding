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
};

export function empresaMetadata(data: LandingEmpresaData): Metadata {
  const { empresa } = data;
  const title = empresaDisplayTitle(empresa);
  const description =
    empresaDisplayDescription(empresa) ||
    `Reservá servicios y pedí productos en ${empresa.nombre}`;
  const logo = empresaLogoPhoto(empresa);

  return {
    title,
    description,
    // El favicon real lo genera `app/icon.tsx` (mismo origen). openGraph usa el logo si hay.
    openGraph: {
      title,
      description,
      ...(logo ? { images: [{ url: logo }] } : {}),
    },
  };
}
