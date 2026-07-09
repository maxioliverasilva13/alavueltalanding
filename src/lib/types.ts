export type LandingServicio = {
  id: number;
  nombre: string;
  precio: string | number;
  divisa: string;
  tiempo: number;
  notas?: string;
  foto?: string;
  profesion_detalle?: { id: number; nombre: string; logo_svg_url?: string };
};

export type LandingProducto = {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: string | number;
  divisa: string;
  foto?: string;
  agotado?: boolean;
};

export type LandingEmpresaData = {
  empresa: {
    id: number;
    nombre: string;
    descripcion: string;
    subdomain: string;
    landing_titulo?: string;
    landing_slogan?: string;
    landing_descripcion?: string;
    landing_foto_url?: string;
    ubicacion?: string;
    latitud?: number;
    longitud?: number;
    compartir_ubicacion_mapa?: boolean;
    vende_productos: boolean;
    vende_servicios: boolean;
    acepta_efectivo: boolean;
    acepta_tarjeta: boolean;
    is_mercadopago_vinculado: boolean;
    pais: string;
    currency: string;
    foto_url?: string;
    rounded_foto_url?: string;
    rating: number;
    cant_calif: number;
    trabajo_domicilio: boolean;
    trabajo_local: boolean;
  };
  admin_id: number;
  horarios: { dia_semana: string; hora_inicio: string; hora_fin: string }[];
  servicios: LandingServicio[];
  productos: LandingProducto[];
  profesiones: { id: number; nombre: string; logo_svg_url?: string }[];
};

/** Formato estándar del backend (StandardizedResponseMiddleware). */
export type ApiResponse<T = unknown> = {
  ok: boolean;
  message: string;
  data: T | null;
};
