export type ServicioImagen = {
  id?: number;
  url: string;
  orden?: number;
};

export type LandingServicio = {
  id: number;
  nombre: string;
  precio: string | number;
  divisa: string;
  tiempo: number;
  notas?: string;
  foto?: string;
  imagenes?: ServicioImagen[];
  profesion_detalle?: { id: number; nombre: string; logo_svg_url?: string };
};

export type ProductoVariante = {
  id?: number;
  nombre: string;
  precio_extra: string | number;
  activo?: boolean;
  orden?: number;
};

export type ProductoImagen = {
  id?: number;
  url: string;
  orden?: number;
};

export type LandingProducto = {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: string | number;
  divisa: string;
  foto?: string;
  imagenes?: ProductoImagen[];
  agotado?: boolean;
  es_menu_diario?: boolean;
  dias_semana?: number[];
  dias_detalle?: { dia_semana: number; activo: boolean }[];
  activo_en_dia?: boolean | null;
  variantes?: ProductoVariante[];
  acepta_domicilio?: boolean;
  acepta_retiro?: boolean;
  categoria?: number | null;
  categoria_nombre?: string | null;
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
    vende_menu_diario: boolean;
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
    /** Radio de cobertura en km (área de trabajo a domicilio). */
    rango_mapa_km?: number;
    /** Override admin: landing aunque el plan no la incluya. */
    tiene_landing_page?: boolean;
  };
  admin_id: number;
  horarios: { dia_semana: string; hora_inicio: string; hora_fin: string }[];
  servicios: LandingServicio[];
  productos: LandingProducto[];
  profesiones: { id: number; nombre: string; logo_svg_url?: string }[];
  /** Zonas de exclusión activas (sin cobertura). */
  zonas_no_trabajo?: {
    id: number;
    nombre: string;
    latitud: number;
    longitud: number;
    radio_km: number;
  }[];
};

/** Formato estándar del backend (StandardizedResponseMiddleware). */
export type ApiResponse<T = unknown> = {
  ok: boolean;
  message: string;
  data: T | null;
};
