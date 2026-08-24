"use client";

export type BookingMode = "servicios" | "productos" | "menu_diario";

export const LANDING_GO_BOOKING = "landing-go-booking";

export function goToBooking(mode: BookingMode) {
  const hash =
    mode === "servicios" ? "servicios" : mode === "menu_diario" ? "menu-diario" : "productos";
  if (window.location.hash.replace(/^#/, "") !== hash) {
    window.history.replaceState(null, "", `#${hash}`);
  }
  window.dispatchEvent(new CustomEvent(LANDING_GO_BOOKING, { detail: { mode } }));
  window.requestAnimationFrame(() => {
    document.getElementById("reservar")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

type Props = {
  vendeServicios: boolean;
  vendeProductos: boolean;
  vendeMenuDiario?: boolean;
};

export default function LandingHeroCtas({ vendeServicios, vendeProductos, vendeMenuDiario }: Props) {
  if (!vendeServicios && !vendeProductos && !vendeMenuDiario) return null;

  const count = [vendeServicios, vendeProductos, vendeMenuDiario].filter(Boolean).length;

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {vendeServicios && (
        <button
          type="button"
          onClick={() => goToBooking("servicios")}
          className={`inline-flex h-11 items-center rounded-xl px-6 text-sm font-semibold transition ${
            count > 1
              ? "border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              : "bg-white text-gray-900 shadow-lg hover:scale-[1.02] hover:opacity-95"
          }`}
        >
          Ver servicios
        </button>
      )}
      {vendeProductos && (
        <button
          type="button"
          onClick={() => goToBooking("productos")}
          className={`inline-flex h-11 items-center rounded-xl px-6 text-sm font-semibold transition ${
            count > 1
              ? "border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              : "bg-white text-gray-900 shadow-lg hover:scale-[1.02] hover:opacity-95"
          }`}
        >
          Ver productos
        </button>
      )}
      {vendeMenuDiario && (
        <button
          type="button"
          onClick={() => goToBooking("menu_diario")}
          className={`inline-flex h-11 items-center rounded-xl px-6 text-sm font-semibold transition ${
            count > 1
              ? "border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              : "bg-white text-gray-900 shadow-lg hover:scale-[1.02] hover:opacity-95"
          }`}
        >
          Ver menú
        </button>
      )}
    </div>
  );
}
