import type { LandingUser } from "./api";

export type ZonaExclusionPublic = {
  id?: number;
  nombre?: string;
  latitud: number | string;
  longitud: number | string;
  radio_km: number | string;
};

export const MENSAJE_ZONA_NO_ATENDIDA =
  "Este profesional no trabaja en tu zona. Podés elegir atención en su local si está disponible.";

export function calcularDistanciaKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const rLat1 = toRad(lat1);
  const rLon1 = toRad(lon1);
  const rLat2 = toRad(lat2);
  const rLon2 = toRad(lon2);
  const dLat = rLat2 - rLat1;
  const dLon = rLon2 - rLon1;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rLat1) * Math.cos(rLat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

export function puntoEnZonaExclusion(
  lat: number,
  lng: number,
  zonas: ZonaExclusionPublic[],
): boolean {
  if (!zonas.length) return false;
  return zonas.some((zona) => {
    const dist = calcularDistanciaKm(
      lat,
      lng,
      Number(zona.latitud),
      Number(zona.longitud),
    );
    return dist <= Number(zona.radio_km);
  });
}

export function ubicacionBloqueadaPorZonas(
  lat: number | null | undefined,
  lng: number | null | undefined,
  zonas: ZonaExclusionPublic[] | null | undefined,
): boolean {
  if (lat == null || lng == null || !zonas?.length) return false;
  return puntoEnZonaExclusion(Number(lat), Number(lng), zonas);
}

export function getUserPrimaryCoords(
  user: LandingUser | null | undefined,
): { lat: number; lng: number } | null {
  if (!user) return null;

  const principal = user.localizacion_principal?.localizacion_detalle;
  if (principal?.latitud != null && principal?.longitud != null) {
    return { lat: Number(principal.latitud), lng: Number(principal.longitud) };
  }

  const fromList = user.localizaciones?.find(
    (loc) => loc.es_principal || loc.localizacion_detalle?.isPrimary,
  )?.localizacion_detalle;

  if (fromList?.latitud != null && fromList?.longitud != null) {
    return { lat: Number(fromList.latitud), lng: Number(fromList.longitud) };
  }

  return null;
}
