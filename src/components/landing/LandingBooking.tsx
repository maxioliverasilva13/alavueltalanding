"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Home,
  Loader2,
  MapPin,
  Package,
  Store,
  Wrench,
} from "lucide-react";
import type { LandingEmpresaData, LandingProducto, LandingServicio } from "@/lib/types";
import { colors } from "@/lib/colors";
import LoginModal from "../LoginModal";
import CardService, { CardHour } from "../ui/CardService";
import CardProduct from "../ui/CardProduct";
import Calendar from "../ui/Calendar";
import FormStepper from "../ui/FormStepper";
import PaymentMethodPicker from "../ui/PaymentMethodPicker";
import {
  agregarAlCarrito,
  actualizarItemCarrito,
  checkoutCarrito,
  crearTrabajo,
  eliminarItemCarrito,
  fetchAvailableDays,
  fetchAvailableHours,
  getCarritoByEmpresa,
  restoreAuthFromStorage,
  type Carrito,
} from "@/lib/api";
import type { ApiResponse } from "@/lib/types";
import { formatPrice } from "@/lib/format";

type Mode = "servicios" | "productos";

type Props = {
  data: LandingEmpresaData;
};

const SERVICE_STEPS = [
  { key: "services", label: "Servicios" },
  { key: "date", label: "Fecha" },
  { key: "time", label: "Hora" },
  { key: "details", label: "Detalles" },
  { key: "payment", label: "Pago" },
  { key: "summary", label: "Resumen" },
];

const PRODUCT_STEPS = [
  { key: "products", label: "Productos" },
  { key: "cart", label: "Carrito" },
  { key: "summary", label: "Confirmar" },
];

function isAuthenticated(): boolean {
  return typeof window !== "undefined" && !!localStorage.getItem("landing_token");
}

function apiErrorMessage(e: unknown): string {
  const err = e as { response?: { data?: ApiResponse | { error?: string; message?: string } } };
  const payload = err?.response?.data;
  if (payload && typeof payload === "object") {
    if ("message" in payload && payload.message) return String(payload.message);
    if ("error" in payload && payload.error) return String(payload.error);
  }
  return "No se pudo completar. Intentá de nuevo.";
}

export default function LandingBooking({ data }: Props) {
  const { empresa, admin_id, servicios, productos, profesiones } = data;
  const [mode, setMode] = useState<Mode>(empresa.vende_servicios ? "servicios" : "productos");
  const [step, setStep] = useState(0);
  const [selectedProfesionId, setSelectedProfesionId] = useState<number>(profesiones[0]?.id ?? 0);
  const [selectedServices, setSelectedServices] = useState<LandingServicio[]>([]);
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [date, setDate] = useState("");
  const [hour, setHour] = useState("");
  const [note, setNote] = useState("");
  const [esDomicilioProfesional, setEsDomicilioProfesional] = useState(
    empresa.trabajo_local && !empresa.trabajo_domicilio
  );
  const [tipoEntrega, setTipoEntrega] = useState<"domicilio" | "retiro">(
    empresa.trabajo_domicilio ? "domicilio" : "retiro"
  );
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "tarjeta">("efectivo");
  const [showLogin, setShowLogin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [availableDays, setAvailableDays] = useState<number[]>([]);
  const [loadingDays, setLoadingDays] = useState(false);
  const [availableHours, setAvailableHours] = useState<{ hora: string; disponible: boolean }[]>([]);
  const [loadingHours, setLoadingHours] = useState(false);

  useEffect(() => {
    restoreAuthFromStorage();
    setIsLoggedIn(isAuthenticated());
  }, []);

  const filteredServicios = useMemo(() => {
    if (!selectedProfesionId) return servicios;
    return servicios.filter(
      (s) =>
        s.profesion_detalle?.id === selectedProfesionId ||
        (s as { profesion?: number }).profesion === selectedProfesionId
    );
  }, [servicios, selectedProfesionId]);

  const serviceIds = useMemo(() => selectedServices.map((s) => s.id), [selectedServices]);

  const loadAvailableDays = async (year?: number, month?: number) => {
    if (!serviceIds.length) return;
    const now = new Date();
    setLoadingDays(true);
    try {
      const result = await fetchAvailableDays({
        usuario_id: admin_id,
        servicios_ids: serviceIds,
        year: year ?? now.getFullYear(),
        month: month ?? now.getMonth() + 1,
      });
      setAvailableDays(result?.dias_disponibles ?? []);
    } catch {
      setAvailableDays([]);
    } finally {
      setLoadingDays(false);
    }
  };

  const loadAvailableHours = async (fecha: string) => {
    if (!serviceIds.length || !fecha) return;
    setLoadingHours(true);
    try {
      const result = await fetchAvailableHours({
        usuario_id: admin_id,
        servicios_ids: serviceIds,
        fecha,
      });
      setAvailableHours(result?.horas ?? []);
    } catch {
      setAvailableHours([]);
    } finally {
      setLoadingHours(false);
    }
  };

  useEffect(() => {
    if (step === 1 && serviceIds.length) {
      void loadAvailableDays();
    }
  }, [step, serviceIds.join(",")]);

  useEffect(() => {
    if (step === 2 && date) {
      void loadAvailableHours(date);
    }
  }, [step, date, serviceIds.join(",")]);

  const totalServicios = selectedServices.reduce((a, s) => a + Number(s.precio), 0);
  const totalDuracion = selectedServices.reduce((a, s) => a + Number(s.tiempo), 0);

  const showDeliveryBoth = empresa.trabajo_domicilio && empresa.trabajo_local;

  const loadCarrito = async () => {
    if (!isAuthenticated()) return;
    setCartLoading(true);
    try {
      const cart = await getCarritoByEmpresa(empresa.id);
      setCarrito(cart);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "productos" && isLoggedIn) void loadCarrito();
  }, [mode, isLoggedIn, empresa.id]);

  const toggleService = (s: LandingServicio) => {
    setSelectedServices((prev) =>
      prev.some((x) => x.id === s.id) ? prev.filter((x) => x.id !== s.id) : [...prev, s]
    );
  };

  const syncCartQty = async (producto: LandingProducto, qty: number) => {
    if (!isAuthenticated()) {
      setShowLogin(true);
      return;
    }
    let cart = carrito ?? (await getCarritoByEmpresa(empresa.id));
    if (!cart) return;

    if (qty <= 0) {
      cart = (await eliminarItemCarrito(cart.id, producto.id)) ?? cart;
    } else {
      const existing = cart.items.find((i) => i.producto === producto.id);
      cart = existing
        ? ((await actualizarItemCarrito(cart.id, producto.id, qty)) ?? cart)
        : ((await agregarAlCarrito(cart.id, producto.id, qty)) ?? cart);
    }
    setCarrito(cart);
  };

  const getProductQty = (productoId: number) =>
    carrito?.items.find((i) => i.producto === productoId)?.cantidad ?? 0;

  const submitOrder = async () => {
    setSubmitting(true);
    setError("");
    try {
      if (mode === "servicios") {
        await crearTrabajo({
          descripcion: note,
          servicios_ids: selectedServices.map((s) => s.id),
          fecha: date,
          hora: hour,
          duracion: totalDuracion,
          profesional_id: admin_id,
          es_domicilio_profesional: esDomicilioProfesional,
          fotos: [],
          metodo_pago: metodoPago === "tarjeta" ? "mercadopago" : "efectivo",
        });
      } else {
        const cart = carrito ?? (await getCarritoByEmpresa(empresa.id));
        if (!cart?.items.length) throw new Error("El carrito está vacío");
        await checkoutCarrito(cart.id, {
          metodo_pago: metodoPago === "tarjeta" ? "mercadopago" : "efectivo",
          tipo_entrega: tipoEntrega,
          notas: note,
        });
      }
      setSuccess(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : apiErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!isAuthenticated()) {
      setShowLogin(true);
      return;
    }
    await submitOrder();
  };

  if (!empresa.vende_servicios && !empresa.vende_productos) return null;

  if (success) {
    return (
      <section className="rounded-2xl border bg-white p-10 text-center shadow-sm" style={{ borderColor: colors.border }}>
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
        <h2 className="mt-4 text-2xl font-bold text-gray-900">¡Listo!</h2>
        <p className="mx-auto mt-2 max-w-sm text-gray-500">
          {mode === "servicios"
            ? "Tu reserva fue enviada. Te confirmaremos a la brevedad."
            : "Tu pedido fue enviado correctamente."}
        </p>
      </section>
    );
  }

  const steps = mode === "servicios" ? SERVICE_STEPS : PRODUCT_STEPS;
  const stepLabel = steps[step]?.label ?? "";

  return (
    <>
      <section
        id="reservar"
        className="scroll-mt-6 overflow-hidden rounded-2xl border bg-white shadow-sm"
        style={{ borderColor: colors.border }}
      >
        <div className="border-b px-6 py-5" style={{ borderColor: colors.border }}>
          <h2 className="text-xl font-semibold text-gray-900">Reservá o pedí online</h2>
          <p className="mt-1 text-sm text-gray-500">Mismo flujo que en la app de Alavuelta</p>
        </div>

        {empresa.vende_servicios && empresa.vende_productos && (
          <div className="flex gap-2 border-b p-4" style={{ borderColor: colors.border }}>
            {(["servicios", "productos"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setStep(0); setError(""); }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold"
                style={{
                  background: mode === m ? colors.primary : "#f8f9fc",
                  color: mode === m ? colors.white : "#374151",
                }}
              >
                {m === "servicios" ? <Wrench className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                {m === "servicios" ? "Servicios" : "Productos"}
              </button>
            ))}
          </div>
        )}

        <div className="border-b px-4 py-4" style={{ borderColor: colors.border }}>
          <FormStepper steps={steps} currentIndex={step} />
        </div>

        <div className="px-6 py-5">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-800"
            >
              <ArrowLeft className="h-4 w-4" /> {stepLabel}
            </button>
          )}

          {mode === "servicios" && empresa.vende_servicios && (
            <>
              {step === 0 && (
                <div className="space-y-4">
                  {profesiones.length > 1 && (
                    <div className="flex flex-wrap gap-2">
                      {profesiones.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedProfesionId(p.id)}
                          className="rounded-full border px-3 py-1.5 text-xs font-semibold"
                          style={{
                            borderColor: selectedProfesionId === p.id ? colors.primary : colors.border,
                            background: selectedProfesionId === p.id ? colors.primaryLighter : colors.white,
                            color: selectedProfesionId === p.id ? colors.primaryDark : "#6B7280",
                          }}
                        >
                          {p.nombre}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="space-y-3">
                    {filteredServicios.map((s) => (
                      <CardService
                        key={s.id}
                        id={s.id}
                        name={s.nombre}
                        description={s.notas}
                        photo={s.foto}
                        price={s.precio}
                        currency={s.divisa}
                        timeInMinutes={s.tiempo}
                        selected={selectedServices.some((x) => x.id === s.id)}
                        onSelect={() => toggleService(s)}
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={selectedServices.length === 0}
                    onClick={() => setStep(1)}
                    className="h-12 w-full rounded-2xl font-semibold text-white disabled:opacity-50"
                    style={{ background: colors.primary }}
                  >
                    Siguiente
                  </button>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-600">
                    <CalendarDays className="h-4 w-4" style={{ color: colors.primary }} /> Elegí una fecha
                  </label>
                  <Calendar
                    value={date}
                    loading={loadingDays}
                    minDate={new Date()}
                    availableDays={availableDays}
                    onChange={(iso) => {
                      setDate(iso);
                      setHour("");
                    }}
                    onMonthChange={(year, month) => void loadAvailableDays(year, month)}
                  />
                  <button
                    type="button"
                    disabled={!date}
                    onClick={() => setStep(2)}
                    className="h-12 w-full rounded-2xl font-semibold text-white disabled:opacity-50"
                    style={{ background: colors.primary }}
                  >
                    Siguiente
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Hora disponible</p>
                  {loadingHours ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    </div>
                  ) : availableHours.length === 0 ? (
                    <p className="text-sm text-gray-500">No hay horarios disponibles para esta fecha.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {availableHours.map(({ hora, disponible }) => (
                        <CardHour
                          key={hora}
                          label={hora}
                          selected={hour === hora}
                          disabled={!disponible}
                          onClick={() => disponible && setHour(hora)}
                        />
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    disabled={!hour}
                    onClick={() => setStep(3)}
                    className="h-12 w-full rounded-2xl font-semibold text-white disabled:opacity-50"
                    style={{ background: colors.primary }}
                  >
                    Siguiente
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <textarea
                    placeholder="Ingrese una nota..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={5}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 focus:border-[#8972FD] focus:ring-1 focus:ring-[#8972FD] outline-none"
                  />
                  {showDeliveryBoth && (
                    <div className="rounded-2xl bg-gray-50 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <MapPin size={14} style={{ color: colors.primary }} />
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                          ¿Dónde se realiza el servicio?
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { enLocal: false, label: "A domicilio", icon: Home },
                          { enLocal: true, label: "En el local", icon: Store },
                        ].map(({ enLocal, label, icon: Icon }) => {
                          const active = esDomicilioProfesional === enLocal;
                          return (
                            <button
                              key={label}
                              type="button"
                              onClick={() => setEsDomicilioProfesional(enLocal)}
                              className="flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 text-center"
                              style={{
                                borderColor: active ? colors.primary : colors.border,
                                background: active ? colors.primaryLighter : colors.white,
                              }}
                            >
                              <Icon size={20} style={{ color: active ? colors.primary : "#9CA3AF" }} />
                              <span className="text-sm font-semibold text-gray-800">{label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <button type="button" onClick={() => setStep(4)} className="h-12 w-full rounded-2xl font-semibold text-white" style={{ background: colors.primary }}>
                    Siguiente
                  </button>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <PaymentMethodPicker
                    metodoPago={metodoPago}
                    setMetodoPago={setMetodoPago}
                    aceptaEfectivo={empresa.acepta_efectivo}
                    aceptaTarjeta={empresa.acepta_tarjeta && empresa.is_mercadopago_vinculado}
                  />
                  <button type="button" onClick={() => setStep(5)} className="h-12 w-full rounded-2xl font-semibold text-white" style={{ background: colors.primary }}>
                    Ver resumen
                  </button>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-2xl border" style={{ borderColor: colors.border }}>
                    <SummaryRow label="Fecha" value={date} />
                    <SummaryRow label="Hora" value={hour} />
                    {selectedServices.map((s) => (
                      <SummaryRow key={s.id} label={s.nombre} value={formatPrice(Number(s.precio), s.divisa)} />
                    ))}
                  </div>
                  <div className="rounded-2xl p-4" style={{ background: colors.primaryLighter, border: `1.5px solid ${colors.primaryLight}` }}>
                    <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: colors.primary }}>Total</p>
                    <p className="text-xl font-bold text-gray-900">{formatPrice(totalServicios, empresa.currency)}</p>
                  </div>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => void handleFinalSubmit()}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl font-semibold text-white disabled:opacity-50"
                    style={{ background: colors.primary }}
                  >
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isLoggedIn ? "Confirmar reserva" : "Iniciar sesión y confirmar"}
                  </button>
                </div>
              )}
            </>
          )}

          {mode === "productos" && empresa.vende_productos && (
            <>
              {step === 0 && (
                <div id="productos" className="space-y-4">
                  {cartLoading && <p className="text-sm text-gray-400">Actualizando carrito...</p>}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {productos.map((p) => (
                      <CardProduct
                        key={p.id}
                        id={p.id}
                        name={p.nombre}
                        description={p.descripcion}
                        photo={p.foto}
                        price={p.precio}
                        currency={p.divisa}
                        soldOut={p.agotado}
                        quantity={getProductQty(p.id)}
                        onChangeQuantity={(qty) => void syncCartQty(p, qty)}
                      />
                    ))}
                  </div>
                  {(carrito?.items.length ?? 0) > 0 && (
                    <button type="button" onClick={() => setStep(1)} className="h-12 w-full rounded-2xl font-semibold text-white" style={{ background: colors.primary }}>
                      Ver carrito ({carrito?.items.reduce((a, i) => a + i.cantidad, 0)})
                    </button>
                  )}
                </div>
              )}

              {step === 1 && (
                <div className="space-y-3">
                  {(carrito?.items ?? []).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.producto_nombre} × {item.cantidad}</span>
                      <span className="font-semibold">{formatPrice(Number(item.subtotal), item.producto_divisa || empresa.currency)}</span>
                    </div>
                  ))}
                  <button type="button" onClick={() => setStep(2)} className="h-12 w-full rounded-2xl font-semibold text-white" style={{ background: colors.primary }}>
                    Siguiente
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-gray-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Tipo de entrega</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {empresa.trabajo_domicilio && (
                        <button type="button" onClick={() => setTipoEntrega("domicilio")} className="rounded-xl border-2 p-3 text-sm font-semibold" style={{ borderColor: tipoEntrega === "domicilio" ? colors.primary : colors.border, background: tipoEntrega === "domicilio" ? colors.primaryLighter : colors.white }}>
                          Domicilio
                        </button>
                      )}
                      {empresa.trabajo_local && (
                        <button type="button" onClick={() => setTipoEntrega("retiro")} className="rounded-xl border-2 p-3 text-sm font-semibold" style={{ borderColor: tipoEntrega === "retiro" ? colors.primary : colors.border, background: tipoEntrega === "retiro" ? colors.primaryLighter : colors.white }}>
                          Retiro en local
                        </button>
                      )}
                    </div>
                  </div>
                  <textarea placeholder="Notas del pedido (opcional)" value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#8972FD] focus:ring-1 focus:ring-[#8972FD]" />
                  <PaymentMethodPicker metodoPago={metodoPago} setMetodoPago={setMetodoPago} aceptaEfectivo={empresa.acepta_efectivo} aceptaTarjeta={empresa.acepta_tarjeta && empresa.is_mercadopago_vinculado} />
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <button type="button" disabled={submitting} onClick={() => void handleFinalSubmit()} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl font-semibold text-white disabled:opacity-50" style={{ background: colors.primary }}>
                    {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isLoggedIn ? "Confirmar pedido" : "Iniciar sesión y confirmar"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={async () => {
          setIsLoggedIn(true);
          await loadCarrito();
          await submitOrder();
        }}
      />
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-3 last:border-b-0" style={{ borderColor: colors.border }}>
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-semibold text-gray-900">{value}</span>
    </div>
  );
}
