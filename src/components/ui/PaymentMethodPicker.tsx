"use client";

import { Banknote, CreditCard } from "lucide-react";
import { colors } from "@/lib/colors";

const PAGO_TARJETA_PROXIMAMENTE = true;

type Props = {
  metodoPago: "efectivo" | "tarjeta";
  setMetodoPago: (v: "efectivo" | "tarjeta") => void;
  aceptaEfectivo: boolean;
  aceptaTarjeta: boolean;
};

export default function PaymentMethodPicker({
  metodoPago,
  setMetodoPago,
  aceptaEfectivo,
  aceptaTarjeta,
}: Props) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <CreditCard size={14} style={{ color: colors.primary }} />
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
          ¿Cómo querés pagar?
        </span>
      </div>
      <div className="flex flex-col gap-2">
        {PAGO_TARJETA_PROXIMAMENTE || !aceptaTarjeta ? (
          <div
            className="flex items-center gap-3 rounded-xl border-2 p-3 opacity-60"
            style={{ borderColor: colors.border, background: colors.white }}
          >
            <CreditCard size={18} className="text-gray-400" />
            <div className="flex-1 text-left">
              <span className="text-sm font-semibold text-gray-500">Tarjeta de crédito/débito</span>
              <p className="text-[11px] text-gray-400">Vía MercadoPago</p>
            </div>
            <span className="rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-600">
              Próximamente
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setMetodoPago("tarjeta")}
            className="flex items-center gap-3 rounded-xl border-2 p-3 transition-all"
            style={{
              borderColor: metodoPago === "tarjeta" ? colors.primary : colors.border,
              background: metodoPago === "tarjeta" ? colors.primaryLighter : colors.white,
            }}
          >
            <CreditCard size={18} style={{ color: metodoPago === "tarjeta" ? colors.primary : "#9CA3AF" }} />
            <div className="flex-1 text-left">
              <span className="text-sm font-semibold text-gray-800">Tarjeta de crédito/débito</span>
              <p className="text-[11px] text-gray-400">Vía MercadoPago</p>
            </div>
          </button>
        )}

        {aceptaEfectivo && (
          <button
            type="button"
            onClick={() => setMetodoPago("efectivo")}
            className="flex items-center gap-3 rounded-xl border-2 p-3 transition-all"
            style={{
              borderColor: metodoPago === "efectivo" ? "#10b981" : colors.border,
              background: metodoPago === "efectivo" ? "#ecfdf5" : colors.white,
            }}
          >
            <Banknote size={18} className={metodoPago === "efectivo" ? "text-emerald-500" : "text-gray-400"} />
            <div className="flex-1 text-left">
              <span className="text-sm font-semibold text-gray-800">Efectivo</span>
              <p className="text-[11px] text-gray-400">Pagás al profesional</p>
            </div>
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                metodoPago === "efectivo" ? "border-emerald-500" : "border-gray-300"
              }`}
            >
              {metodoPago === "efectivo" && <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />}
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
