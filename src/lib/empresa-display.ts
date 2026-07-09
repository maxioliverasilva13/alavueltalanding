import type { LandingEmpresaData } from "./types";

type Empresa = LandingEmpresaData["empresa"];

export function empresaDisplayTitle(empresa: Empresa): string {
  return empresa.landing_titulo?.trim() || empresa.nombre;
}

export function empresaDisplaySlogan(empresa: Empresa): string | null {
  const slogan = empresa.landing_slogan?.trim();
  return slogan || null;
}

export function empresaDisplayDescription(empresa: Empresa): string | null {
  const desc = empresa.landing_descripcion?.trim() || empresa.descripcion?.trim();
  return desc || null;
}

export function empresaLogoPhoto(empresa: Empresa): string | null {
  return empresa.rounded_foto_url?.trim() || empresa.foto_url?.trim() || null;
}

export function empresaCoverPhoto(empresa: Empresa): string | null {
  const url = empresa.landing_foto_url?.trim();
  return url || null;
}

export function empresaDisplayPhoto(empresa: Empresa): string | null {
  return (
    empresaCoverPhoto(empresa) ||
    empresa.rounded_foto_url?.trim() ||
    empresa.foto_url?.trim() ||
    null
  );
}

export function empresaHasMap(empresa: Empresa): boolean {
  return !!(
    empresa.compartir_ubicacion_mapa &&
    Number.isFinite(empresa.latitud) &&
    Number.isFinite(empresa.longitud)
  );
}
