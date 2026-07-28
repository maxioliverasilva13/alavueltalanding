import type { Metadata } from "next";
import type { LandingEmpresaData } from "./types";
import {
  empresaCoverPhoto,
  empresaDisplayDescription,
  empresaDisplaySlogan,
  empresaDisplayTitle,
  empresaLogoPhoto,
} from "./empresa-display";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "alavueltaapp.pro";

export function landingPublicOrigin(subdomain: string): string {
  return `https://${subdomain}.${ROOT_DOMAIN}`;
}

export function landingPublicUrl(subdomain: string, path = "/"): string {
  const origin = landingPublicOrigin(subdomain);
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${normalized === "/" ? "" : normalized}`;
}

function buildSeoTitle(empresa: LandingEmpresaData["empresa"]): string {
  const title = empresaDisplayTitle(empresa);
  const nombre = empresa.nombre?.trim();
  // Incluir nombre legal/comercial si el título custom es distinto → mejor match en búsquedas.
  if (nombre && title.toLowerCase() !== nombre.toLowerCase()) {
    return `${title} | ${nombre}`;
  }
  if (empresa.ubicacion?.trim()) {
    return `${title} | ${empresa.ubicacion.trim()}`;
  }
  return title;
}

function buildSeoDescription(data: LandingEmpresaData): string {
  const { empresa, profesiones, servicios, productos } = data;
  const custom = empresaDisplayDescription(empresa);
  if (custom && custom.length >= 80) return custom.slice(0, 300);

  const parts: string[] = [];
  const slogan = empresaDisplaySlogan(empresa);
  if (slogan) parts.push(slogan);

  const offers: string[] = [];
  if (empresa.vende_servicios) {
    const names = profesiones.map((p) => p.nombre).filter(Boolean).slice(0, 4);
    if (names.length) offers.push(`Servicios: ${names.join(", ")}`);
    else if (servicios.length) offers.push(`${servicios.length} servicios disponibles`);
  }
  if (empresa.vende_productos && productos.length) {
    offers.push(`${productos.length} productos`);
  }
  if (offers.length) parts.push(offers.join(". "));

  if (empresa.ubicacion) parts.push(`Ubicación: ${empresa.ubicacion}`);
  if (empresa.trabajo_domicilio) parts.push("Atención a domicilio");
  if (empresa.trabajo_local) parts.push("Atención en local");

  const fallback =
    parts.join(". ") ||
    `Reservá servicios y pedí productos en ${empresa.nombre} con ALaVuelta.`;
  return fallback.slice(0, 300);
}

export const alavueltaIcons: Metadata["icons"] = {
  icon: [
    { url: "/icons/icon-48.webp", sizes: "48x48", type: "image/webp" },
    { url: "/icons/icon-192.webp", sizes: "192x192", type: "image/webp" },
  ],
  apple: [{ url: "/icons/icon-192.webp" }],
};

export const loadingMetadata: Metadata = {
  title: "ALaVuelta",
  description: "Reservá servicios y pedí productos",
  robots: { index: false, follow: false },
};

export function empresaMetadata(data: LandingEmpresaData): Metadata {
  const { empresa } = data;
  const subdomain = empresa.subdomain;
  const url = landingPublicUrl(subdomain);
  const title = buildSeoTitle(empresa);
  const description = buildSeoDescription(data);
  const logo = empresaLogoPhoto(empresa);
  const cover = empresaCoverPhoto(empresa);
  const ogImage = cover || logo;

  return {
    title: { absolute: title },
    description,
    applicationName: "ALaVuelta",
    authors: [{ name: empresa.nombre }],
    creator: empresa.nombre,
    publisher: "ALaVuelta",
    category: "business",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "es_UY",
      url,
      siteName: empresa.nombre,
      title,
      description,
      ...(ogImage
        ? {
            images: [
              {
                url: ogImage,
                alt: title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    other: {
      "geo.region": empresa.pais || "UY",
      ...(empresa.ubicacion ? { "geo.placename": empresa.ubicacion } : {}),
    },
  };
}

const DAY_TO_SCHEMA: Record<string, string> = {
  "1": "Monday",
  "2": "Tuesday",
  "3": "Wednesday",
  "4": "Thursday",
  "5": "Friday",
  "6": "Saturday",
  "7": "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

function schemaDay(dia: string): string | null {
  return DAY_TO_SCHEMA[dia.toLowerCase()] ?? DAY_TO_SCHEMA[String(Number(dia))] ?? null;
}

/** JSON-LD LocalBusiness para rich results en Google. */
export function buildLocalBusinessJsonLd(data: LandingEmpresaData): Record<string, unknown> {
  const { empresa, horarios, servicios, productos, profesiones } = data;
  const url = landingPublicUrl(empresa.subdomain);
  const logo = empresaLogoPhoto(empresa);
  const cover = empresaCoverPhoto(empresa);
  const description = buildSeoDescription(data);

  const openingHoursSpecification = horarios
    .map((h) => {
      const day = schemaDay(h.dia_semana);
      if (!day) return null;
      return {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: day,
        opens: h.hora_inicio.slice(0, 5),
        closes: h.hora_fin.slice(0, 5),
      };
    })
    .filter(Boolean);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${url}/#business`,
    name: empresa.nombre,
    alternateName: empresaDisplayTitle(empresa),
    description,
    url,
    ...(logo || cover ? { image: [cover, logo].filter(Boolean) } : {}),
    ...(logo ? { logo } : {}),
    ...(empresa.ubicacion
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: empresa.ubicacion,
            addressCountry: empresa.pais || "UY",
          },
        }
      : {}),
    ...(Number.isFinite(empresa.latitud) && Number.isFinite(empresa.longitud)
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: empresa.latitud,
            longitude: empresa.longitud,
          },
        }
      : {}),
    ...(openingHoursSpecification.length
      ? { openingHoursSpecification }
      : {}),
    ...(empresa.cant_calif > 0 && empresa.rating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(empresa.rating.toFixed(1)),
            reviewCount: empresa.cant_calif,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    areaServed: {
      "@type": "GeoCircle",
      ...(Number.isFinite(empresa.latitud) && Number.isFinite(empresa.longitud)
        ? {
            geoMidpoint: {
              "@type": "GeoCoordinates",
              latitude: empresa.latitud,
              longitude: empresa.longitud,
            },
          }
        : {}),
      geoRadius: `${Math.max(1, Number(empresa.rango_mapa_km) || 10)} km`,
    },
  };

  const offers: Record<string, unknown>[] = [];

  if (empresa.vende_servicios) {
    for (const s of servicios.slice(0, 20)) {
      offers.push({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: s.nombre,
          ...(s.notas ? { description: s.notas } : {}),
          ...(s.profesion_detalle?.nombre
            ? { serviceType: s.profesion_detalle.nombre }
            : {}),
        },
        price: Number(s.precio),
        priceCurrency: s.divisa || empresa.currency || "UYU",
        availability: "https://schema.org/InStock",
        url,
      });
    }
  }

  if (empresa.vende_productos) {
    for (const p of productos.slice(0, 20)) {
      offers.push({
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: p.nombre,
          ...(p.descripcion ? { description: p.descripcion } : {}),
          ...(p.foto ? { image: p.foto } : {}),
        },
        price: Number(p.precio),
        priceCurrency: p.divisa || empresa.currency || "UYU",
        availability: p.agotado
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
        url,
      });
    }
  }

  if (offers.length) {
    jsonLd.hasOfferCatalog = {
      "@type": "OfferCatalog",
      name: `Ofertas de ${empresa.nombre}`,
      itemListElement: offers,
    };
  }

  if (profesiones.length) {
    jsonLd.knowsAbout = profesiones.map((p) => p.nombre);
  }

  return jsonLd;
}
