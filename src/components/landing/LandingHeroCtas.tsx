"use client";

import { colors } from "@/lib/colors";

export type BookingMode = "servicios" | "productos";

export const LANDING_GO_BOOKING = "landing-go-booking";

export function goToBooking(mode: BookingMode) {
  const hash = mode === "servicios" ? "servicios" : "productos";
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
};

export default function LandingHeroCtas({ vendeServicios, vendeProductos }: Props) {
  if (!vendeServicios && !vendeProductos) return null;

  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {vendeServicios && (
        <button
          type="button"
          onClick={() => goToBooking("servicios")}
          className="inline-flex h-11 items-center rounded-xl px-6 text-sm font-semibold text-gray-900 shadow-lg transition hover:scale-[1.02] hover:opacity-95"
          style={{ background: colors.white }}
        >
          Ver servicios
        </button>
      )}
      {vendeProductos && (
        <button
          type="button"
          onClick={() => goToBooking("productos")}
          className={`inline-flex h-11 items-center rounded-xl px-6 text-sm font-semibold transition ${
            vendeServicios
              ? "border border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
              : "bg-white text-gray-900 shadow-lg hover:scale-[1.02] hover:opacity-95"
          }`}
        >
          Ver productos
        </button>
      )}
    </div>
  );
}
