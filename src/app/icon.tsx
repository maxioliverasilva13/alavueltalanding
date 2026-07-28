import { readFile } from "fs/promises";
import path from "path";
import { headers } from "next/headers";
import { ImageResponse } from "next/og";
import { getLandingData } from "@/lib/api";
import { empresaDisplayTitle, empresaLogoPhoto } from "@/lib/empresa-display";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

async function fallbackIcon(letter: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#8972FD",
          color: "white",
          fontSize: 32,
          fontWeight: 700,
          borderRadius: 16,
        }}
      >
        {letter}
      </div>
    ),
    { ...size }
  );
}

async function alavueltaFallback() {
  try {
    const file = await readFile(path.join(process.cwd(), "public/icons/icon-48.webp"));
    return new Response(file, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return fallbackIcon("A");
  }
}

export default async function Icon() {
  const h = await headers();
  const subdomain = h.get("x-subdomain");

  if (!subdomain) {
    return alavueltaFallback();
  }

  const data = await getLandingData(subdomain);
  if (!data) {
    return alavueltaFallback();
  }

  const logo = empresaLogoPhoto(data.empresa);
  const title = empresaDisplayTitle(data.empresa);
  const letter = (title.trim().charAt(0) || "A").toUpperCase();

  if (logo) {
    try {
      const imgRes = await fetch(logo, {
        headers: { "User-Agent": "ALaVueltaLanding/1.0" },
        next: { revalidate: 3600 },
      });
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const type = imgRes.headers.get("content-type") || "image/png";
        return new Response(buffer, {
          headers: {
            "Content-Type": type,
            "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
          },
        });
      }
    } catch {
      /* fallback below */
    }
  }

  return fallbackIcon(letter);
}
