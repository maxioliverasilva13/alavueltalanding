import axios from "axios";
import { cache } from "react";
import type { ApiResponse, LandingEmpresaData } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export type CarritoItem = {
  id: number;
  producto: number;
  producto_nombre: string;
  producto_divisa?: string;
  cantidad: number;
  subtotal: string | number;
  producto_acepta_domicilio?: boolean;
  producto_acepta_retiro?: boolean;
};

export type Carrito = {
  id: number;
  empresa: number;
  items: CarritoItem[];
  total?: string;
  totales_por_divisa?: Record<string, string>;
};

function unwrapApiData<T>(payload: ApiResponse<T> | T): T | null {
  if (payload && typeof payload === "object" && "ok" in payload && "data" in payload) {
    const wrapped = payload as ApiResponse<T>;
    return wrapped.ok ? wrapped.data : null;
  }
  return (payload as T) ?? null;
}

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    if (typeof window !== "undefined") {
      localStorage.setItem("landing_token", token);
    }
  } else {
    delete api.defaults.headers.common.Authorization;
    if (typeof window !== "undefined") {
      localStorage.removeItem("landing_token");
      localStorage.removeItem("landing_refresh");
    }
  }
}

export function restoreAuthFromStorage() {
  if (typeof window === "undefined") return;
  const token = localStorage.getItem("landing_token");
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export async function fetchLandingBySubdomain(subdomain: string): Promise<LandingEmpresaData | null> {
  try {
    const { data } = await api.get<ApiResponse<LandingEmpresaData>>(`/empresas/public/${subdomain}/`);
    const landing = unwrapApiData(data);
    return landing?.empresa ? landing : null;
  } catch {
    return null;
  }
}

export const getLandingData = cache(fetchLandingBySubdomain);

export async function socialLogin(body: {
  firebase_token: string;
  email: string;
  nombre: string;
  foto_url: string;
}) {
  const { data } = await api.post<ApiResponse<{ tokens?: { access?: string; refresh?: string } }>>(
    "/usuarios/social-login/",
    body
  );
  return unwrapApiData(data);
}

export async function emailLogin(body: { correo: string; password: string }) {
  const { data } = await api.post<ApiResponse<{ tokens?: { access?: string; refresh?: string } }>>(
    "/usuarios/login/",
    body
  );
  return unwrapApiData(data);
}

export function persistLoginTokens(tokens?: { access?: string; refresh?: string }) {
  const access = tokens?.access;
  if (!access) return false;

  setAuthToken(access);
  if (tokens?.refresh && typeof window !== "undefined") {
    localStorage.setItem("landing_refresh", tokens.refresh);
  }
  notifyAuthChanged();
  return true;
}

export const LANDING_AUTH_CHANGED = "landing-auth-changed";

export function notifyAuthChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(LANDING_AUTH_CHANGED));
  }
}

export type LandingUser = {
  nombre?: string;
  apellido?: string;
};

export async function fetchCurrentUser(): Promise<LandingUser | null> {
  try {
    const { data } = await api.get<ApiResponse<LandingUser>>("/usuarios/me/");
    return unwrapApiData(data);
  } catch {
    return null;
  }
}

export async function crearTrabajo(body: Record<string, unknown>) {
  const { data } = await api.post<ApiResponse<unknown>>("/trabajos/", body);
  return unwrapApiData(data);
}

export async function getCarritoByEmpresa(empresaId: number): Promise<Carrito | null> {
  const { data } = await api.get<ApiResponse<Carrito>>(`/carritos/empresa/${empresaId}/`);
  return unwrapApiData(data);
}

export async function agregarAlCarrito(carritoId: number, productoId: number, cantidad: number) {
  const { data } = await api.post<ApiResponse<Carrito>>(`/carritos/${carritoId}/agregar-item/`, {
    producto_id: productoId,
    cantidad,
  });
  return unwrapApiData(data);
}

export async function actualizarItemCarrito(carritoId: number, productoId: number, cantidad: number) {
  const { data } = await api.post<ApiResponse<Carrito>>(`/carritos/${carritoId}/actualizar-item/`, {
    producto_id: productoId,
    cantidad,
  });
  return unwrapApiData(data);
}

export async function eliminarItemCarrito(carritoId: number, productoId: number) {
  const { data } = await api.delete<ApiResponse<Carrito>>(`/carritos/${carritoId}/eliminar-item/${productoId}/`);
  return unwrapApiData(data);
}

export async function checkoutCarrito(
  carritoId: number,
  body: {
    metodo_pago: "efectivo" | "mercadopago";
    tipo_entrega?: "domicilio" | "retiro";
    notas?: string;
  }
) {
  const { data } = await api.post<ApiResponse<unknown>>(`/carritos/${carritoId}/checkout/`, body);
  return unwrapApiData(data);
}

export async function fetchAvailableDays(params: {
  usuario_id: number;
  servicios_ids: number[];
  year: number;
  month: number;
}) {
  const { data } = await api.post<ApiResponse<{ dias_disponibles: number[] }>>(
    "/disponibilidades/dias-disponibles-mes/",
    params
  );
  return unwrapApiData(data);
}

export async function fetchAvailableHours(params: {
  usuario_id: number;
  servicios_ids: number[];
  fecha: string;
}) {
  const { data } = await api.post<ApiResponse<{ horas: { hora: string; disponible: boolean }[] }>>(
    "/disponibilidades/horas-disponibles-dia/",
    params
  );
  return unwrapApiData(data);
}
