"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Home,
  Loader2,
  Store,
  UtensilsCrossed,
  X,
} from "lucide-react";
import type { LandingEmpresaData } from "@/lib/types";
import { colors } from "@/lib/colors";
import CardProduct from "../ui/CardProduct";
import FormStepper from "../ui/FormStepper";
import {
  agregarAlCarrito,
  actualizarItemCarrito,
  checkoutCarrito,
  eliminarItemCarrito,
  fetchCurrentUser,
  getCarritoByEmpresa,
  listarProductosMenu,
  type Carrito,
  type LandingProductoApi,
  type LandingUser,
} from "@/lib/api";
import type { ApiResponse } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import {
  canAddDeliveryItem,
  defaultTipoEntrega,
  getCompanyDeliveryDefaults,
  getDeliveryIntersection,
} from "@/lib/deliveryUtils";
import {
  DIA_LABELS,
  formatMenuDateLabel,
  isoWeekday,
  parseIsoDate,
  todayDiaSemana,
  upcomingDatesForDias,
} from "@/lib/menuDiarioUtils";
import {
  getUserPrimaryCoords,
  MENSAJE_ZONA_NO_ATENDIDA,
  ubicacionBloqueadaPorZonas,
} from "@/lib/zonasNoTrabajoUtils";

const STEPS = [
  { key: "menu", label: "Menú" },
  { key: "cart", label: "Carrito" },
  { key: "summary", label: "Confirmar" },
];

type Props = {
  empresa: LandingEmpresaData["empresa"];
  zonasNoTrabajo?: LandingEmpresaData["zonas_no_trabajo"];
  isLoggedIn: boolean;
  onRequireLogin: () => void;
  onSuccess: () => void;
};

function apiErrorMessage(e: unknown): string {
  const err = e as { response?: { data?: ApiResponse | { error?: string; message?: string } } };
  const payload = err?.response?.data;
  if (payload && typeof payload === "object") {
    if ("message" in payload && payload.message) return String(payload.message);
    if ("error" in payload && payload.error) return String(payload.error);
  }
  return "No se pudo completar. Intentá de nuevo.";
}

export default function LandingMenuDiario({
  empresa,
  zonasNoTrabajo = [],
  isLoggedIn,
  onRequireLogin,
  onSuccess,
}: Props) {
  const [step, setStep] = useState(0);
  const [platos, setPlatos] = useState<LandingProductoApi[]>([]);
  const [diasConMenu, setDiasConMenu] = useState<number[]>([]);
  const [selectedDia, setSelectedDia] = useState(todayDiaSemana());
  const [loadingPlatos, setLoadingPlatos] = useState(true);
  const [carrito, setCarrito] = useState<Carrito | null>(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [user, setUser] = useState<LandingUser | null>(null);
  const [tipoEntrega, setTipoEntrega] = useState<"domicilio" | "retiro">(
    empresa.trabajo_domicilio ? "domicilio" : "retiro",
  );
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "transferencia">(
    empresa.acepta_efectivo ? "efectivo" : "transferencia",
  );
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [variantPicker, setVariantPicker] = useState<LandingProductoApi | null>(null);
  const [datePicker, setDatePicker] = useState<{
    producto: LandingProductoApi;
    varianteId: number | null;
    fechas: string[];
    selected: string;
  } | null>(null);

  const companyDelivery = useMemo(
    () => getCompanyDeliveryDefaults(empresa.trabajo_domicilio, empresa.trabajo_local),
    [empresa.trabajo_domicilio, empresa.trabajo_local],
  );

  const cartDeliveryItems = useMemo(
    () =>
      (carrito?.items ?? []).map((item) => ({
        acepta_domicilio: item.producto_acepta_domicilio ?? true,
        acepta_retiro: item.producto_acepta_retiro ?? true,
      })),
    [carrito?.items],
  );

  const cartDeliveryOptions = useMemo(
    () => getDeliveryIntersection(cartDeliveryItems),
    [cartDeliveryItems],
  );

  const userCoords = useMemo(() => getUserPrimaryCoords(user), [user]);
  const domicilioBloqueadoPorZona = useMemo(
    () => ubicacionBloqueadaPorZonas(userCoords?.lat, userCoords?.lng, zonasNoTrabajo),
    [userCoords, zonasNoTrabajo],
  );

  const showDomicilioOption = cartDeliveryItems.length
    ? cartDeliveryOptions.acepta_domicilio && companyDelivery.acepta_domicilio
    : companyDelivery.acepta_domicilio;
  const showRetiroOption = cartDeliveryItems.length
    ? cartDeliveryOptions.acepta_retiro && companyDelivery.acepta_retiro
    : companyDelivery.acepta_retiro;
  const showDomicilioEffective = showDomicilioOption && !domicilioBloqueadoPorZona;
  const canCheckoutDelivery = showDomicilioEffective || showRetiroOption;

  const cartFechaMenu = carrito?.fecha_menu || null;
  const cartLockedDia = useMemo(() => {
    if (!cartFechaMenu) return null;
    return isoWeekday(parseIsoDate(cartFechaMenu));
  }, [cartFechaMenu]);

  const loadPlatos = useCallback(async () => {
    setLoadingPlatos(true);
    try {
      const [delDia, allMenu] = await Promise.all([
        listarProductosMenu({ empresa_id: empresa.id, dia_semana: selectedDia }),
        listarProductosMenu({ empresa_id: empresa.id }),
      ]);
      setPlatos(delDia.filter((p) => p.activo_en_dia !== false));
      const dias = new Set<number>();
      for (const p of allMenu) {
        for (const d of p.dias_semana || []) dias.add(d);
      }
      const sorted = [...dias].sort((a, b) => a - b);
      setDiasConMenu(sorted);
    } catch {
      setPlatos([]);
    } finally {
      setLoadingPlatos(false);
    }
  }, [empresa.id, selectedDia]);

  const loadCarrito = useCallback(async () => {
    if (!isLoggedIn) return;
    setCartLoading(true);
    try {
      const cart = await getCarritoByEmpresa(empresa.id);
      setCarrito(cart);
    } finally {
      setCartLoading(false);
    }
  }, [empresa.id, isLoggedIn]);

  useEffect(() => {
    void loadPlatos();
  }, [loadPlatos]);

  useEffect(() => {
    if (isLoggedIn) {
      void loadCarrito();
      void fetchCurrentUser().then(setUser);
    } else {
      setUser(null);
      setCarrito(null);
    }
  }, [isLoggedIn, loadCarrito]);

  useEffect(() => {
    const effectiveCompany = {
      ...companyDelivery,
      acepta_domicilio: showDomicilioEffective,
    };
    setTipoEntrega(defaultTipoEntrega(cartDeliveryItems, effectiveCompany));
  }, [cartDeliveryItems, companyDelivery, showDomicilioEffective]);

  const cartItems = carrito?.items ?? [];

  const getCartQty = (productoId: number) =>
    cartItems
      .filter((i) => i.producto === productoId)
      .reduce((acc, i) => acc + i.cantidad, 0);

  const tryChangeDia = (dia: number) => {
    if (cartLockedDia != null && cartLockedDia !== dia) {
      setError(`Tu pedido es para ${formatMenuDateLabel(cartFechaMenu!)}. Solo podés agregar platos de ese día.`);
      return;
    }
    setError("");
    setSelectedDia(dia);
  };

  const openAddFlow = (producto: LandingProductoApi) => {
    if (producto.agotado) return;
    const variantes = (producto.variantes || []).filter((v) => v.activo !== false);
    if (variantes.length > 0) {
      setVariantPicker(producto);
      return;
    }
    openDatePicker(producto, null);
  };

  const openDatePicker = (producto: LandingProductoApi, varianteId: number | null) => {
    if (cartFechaMenu) {
      void addToCart(producto.id, varianteId, cartFechaMenu);
      return;
    }
    const fechas = upcomingDatesForDias(producto.dias_semana || [selectedDia]);
    if (!fechas.length) {
      setError("Este plato no tiene fechas disponibles.");
      return;
    }
    setDatePicker({ producto, varianteId, fechas, selected: fechas[0] });
  };

  const addToCart = async (
    productoId: number,
    varianteId: number | null,
    fechaMenu: string,
  ) => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }

    const producto = platos.find((p) => p.id === productoId)
      ?? datePicker?.producto
      ?? variantPicker;
    if (!producto) return;

    const candidate = {
      acepta_domicilio: producto.acepta_domicilio ?? true,
      acepta_retiro: producto.acepta_retiro ?? true,
    };
    if (!canAddDeliveryItem(cartDeliveryItems, candidate)) {
      setError("No podés combinar este plato con los del carrito: no comparten la misma modalidad de entrega.");
      return;
    }

    let cart = carrito ?? (await getCarritoByEmpresa(empresa.id));
    if (!cart) return;

    const existing = (cart.items ?? []).find(
      (i) => i.producto === productoId && (i.variante ?? null) === varianteId,
    );

    try {
      if (existing) {
        cart = (await actualizarItemCarrito(
          cart.id,
          productoId,
          existing.cantidad + 1,
          empresa.id,
          varianteId,
        )) ?? cart;
      } else {
        cart = (await agregarAlCarrito(cart.id, productoId, 1, {
          varianteId,
          fechaMenu,
          empresaId: empresa.id,
        })) ?? cart;
      }
      setCarrito(cart);
      setVariantPicker(null);
      setDatePicker(null);
      setError("");
    } catch (e) {
      setError(apiErrorMessage(e));
    }
  };

  const syncCartQty = async (producto: LandingProductoApi, qty: number) => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    let cart = carrito ?? (await getCarritoByEmpresa(empresa.id));
    if (!cart) return;

    const lines = (cart.items ?? []).filter((i) => i.producto === producto.id);
    if (!lines.length && qty > 0) {
      openAddFlow(producto);
      return;
    }

    try {
      const line = lines[lines.length - 1];
      const varianteId = line?.variante ?? null;
      if (qty <= 0 && line) {
        cart = (await eliminarItemCarrito(cart.id, producto.id, empresa.id, varianteId)) ?? cart;
      } else if (line) {
        cart = (await actualizarItemCarrito(cart.id, producto.id, qty, empresa.id, varianteId)) ?? cart;
      }
      setCarrito(cart);
    } catch (e) {
      setError(apiErrorMessage(e));
    }
  };

  const submitOrder = async () => {
    setSubmitting(true);
    setError("");
    try {
      const cart = carrito ?? (await getCarritoByEmpresa(empresa.id));
      if (!cart?.items.length) throw new Error("El carrito está vacío");
      await checkoutCarrito(cart.id, {
        metodo_pago: metodoPago,
        tipo_entrega: tipoEntrega,
        notas: note || undefined,
      });
      onSuccess();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : apiErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  const cartItemCount = cartItems.reduce((a, i) => a + i.cantidad, 0);
  const cartTotal = cartItems.reduce((a, i) => a + Number(i.subtotal), 0);

  return (
    <div className="space-y-4">
      <FormStepper steps={STEPS} currentIndex={step} />

      {step > 0 && (
        <button
          type="button"
          onClick={() => setStep((s) => s - 1)}
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="h-4 w-4" /> Volver
        </button>
      )}

      {cartFechaMenu && step === 0 && (
        <div
          className="rounded-xl border px-4 py-3 text-sm"
          style={{ borderColor: colors.primaryLight, background: colors.primaryLighter }}
        >
          <div className="flex items-center gap-2 font-semibold" style={{ color: colors.primaryDark }}>
            <Calendar className="h-4 w-4" />
            Pedido para {formatMenuDateLabel(cartFechaMenu)}
          </div>
          <p className="mt-1 text-xs text-gray-600">
            Solo podés agregar platos de {DIA_LABELS[cartLockedDia ?? selectedDia]}.
          </p>
        </div>
      )}

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      {step === 0 && (
        <>
          {diasConMenu.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {diasConMenu.map((dia) => {
                const isToday = dia === todayDiaSemana();
                const active = selectedDia === dia;
                const locked = cartLockedDia != null && cartLockedDia !== dia;
                return (
                  <button
                    key={dia}
                    type="button"
                    disabled={locked}
                    onClick={() => tryChangeDia(dia)}
                    className="shrink-0 rounded-xl border-2 px-4 py-2 text-xs font-semibold transition disabled:opacity-40"
                    style={{
                      borderColor: active ? colors.primary : colors.border,
                      background: active ? colors.primaryLighter : colors.white,
                      color: active ? colors.primaryDark : "#6B7280",
                    }}
                  >
                    {DIA_LABELS[dia]}
                    {isToday ? " · hoy" : ""}
                  </button>
                );
              })}
            </div>
          )}

          {loadingPlatos || cartLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : platos.length === 0 ? (
            <div className="py-12 text-center">
              <UtensilsCrossed className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">No hay platos para este día.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {platos.map((p) => (
                <CardProduct
                  key={p.id}
                  id={p.id}
                  name={p.nombre}
                  description={p.descripcion}
                  photo={p.foto}
                  price={p.precio}
                  currency={p.divisa}
                  soldOut={p.agotado}
                  quantity={getCartQty(p.id)}
                  onChangeQuantity={(qty) => void syncCartQty(p, qty)}
                />
              ))}
            </div>
          )}

          {cartItemCount > 0 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="h-12 w-full rounded-2xl font-semibold text-white"
              style={{ background: colors.primary }}
            >
              Ver carrito ({cartItemCount}) · {formatPrice(cartTotal, empresa.currency)}
            </button>
          )}
        </>
      )}

      {step === 1 && (
        <div className="space-y-3">
          {cartFechaMenu && (
            <p className="text-sm font-medium text-gray-700">
              Menú para {formatMenuDateLabel(cartFechaMenu)}
            </p>
          )}
          {(carrito?.items ?? []).map((item) => (
            <div key={`${item.producto}-${item.variante ?? "base"}`} className="flex justify-between text-sm">
              <span>
                {item.producto_nombre}
                {item.variante_nombre ? ` (${item.variante_nombre})` : ""} × {item.cantidad}
              </span>
              <span className="font-semibold">
                {formatPrice(Number(item.subtotal), item.producto_divisa || empresa.currency)}
              </span>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setStep(2)}
            className="h-12 w-full rounded-2xl font-semibold text-white"
            style={{ background: colors.primary }}
          >
            Confirmar pedido
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          {(showDomicilioOption || showRetiroOption) && (
            <div className="rounded-2xl bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Tipo de entrega</p>
              {domicilioBloqueadoPorZona && showDomicilioOption && (
                <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
                  {MENSAJE_ZONA_NO_ATENDIDA}
                </p>
              )}
              <div className="mt-2 grid grid-cols-2 gap-2">
                {showDomicilioOption && (
                  <button
                    type="button"
                    disabled={!showDomicilioEffective}
                    onClick={() => setTipoEntrega("domicilio")}
                    className="rounded-xl border-2 p-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      borderColor: tipoEntrega === "domicilio" && showDomicilioEffective ? colors.primary : colors.border,
                      background: tipoEntrega === "domicilio" && showDomicilioEffective ? colors.primaryLighter : colors.white,
                    }}
                  >
                    <Home className="mx-auto mb-1 h-4 w-4" />
                    Domicilio
                  </button>
                )}
                {showRetiroOption && (
                  <button
                    type="button"
                    onClick={() => setTipoEntrega("retiro")}
                    className="rounded-xl border-2 p-3 text-sm font-semibold"
                    style={{
                      borderColor: tipoEntrega === "retiro" ? colors.primary : colors.border,
                      background: tipoEntrega === "retiro" ? colors.primaryLighter : colors.white,
                    }}
                  >
                    <Store className="mx-auto mb-1 h-4 w-4" />
                    Retiro
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-600">Forma de pago</p>
            <div className="mt-2 flex flex-col gap-2">
              {empresa.acepta_efectivo && (
                <button
                  type="button"
                  onClick={() => setMetodoPago("efectivo")}
                  className="rounded-xl border-2 p-3 text-left text-sm font-semibold"
                  style={{
                    borderColor: metodoPago === "efectivo" ? "#10b981" : colors.border,
                    background: metodoPago === "efectivo" ? "#ecfdf5" : colors.white,
                  }}
                >
                  Efectivo — pagás al recibir
                </button>
              )}
              <button
                type="button"
                onClick={() => setMetodoPago("transferencia")}
                className="rounded-xl border-2 p-3 text-left text-sm font-semibold"
                style={{
                  borderColor: metodoPago === "transferencia" ? colors.primary : colors.border,
                  background: metodoPago === "transferencia" ? colors.primaryLighter : colors.white,
                }}
              >
                Transferencia — el local confirma el pago
              </button>
            </div>
          </div>

          <textarea
            placeholder="Notas del pedido (opcional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#8972FD] focus:ring-1 focus:ring-[#8972FD]"
          />

          <div className="rounded-2xl p-4" style={{ background: colors.primaryLighter }}>
            <p className="text-xs font-semibold uppercase text-gray-600">Total</p>
            <p className="text-xl font-bold text-gray-900">{formatPrice(cartTotal, empresa.currency)}</p>
          </div>

          <button
            type="button"
            disabled={submitting || !canCheckoutDelivery}
            onClick={() => {
              if (!isLoggedIn) {
                onRequireLogin();
                return;
              }
              void submitOrder();
            }}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl font-semibold text-white disabled:opacity-50"
            style={{ background: colors.primary }}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoggedIn ? "Confirmar pedido" : "Iniciar sesión y confirmar"}
          </button>
        </div>
      )}

      {variantPicker && (
        <ModalShell onClose={() => setVariantPicker(null)} title="Elegí una opción">
          <div className="space-y-2">
            {(variantPicker.variantes || []).filter((v) => v.activo !== false).map((v) => (
              <button
                key={v.id ?? v.nombre}
                type="button"
                onClick={() => {
                  setVariantPicker(null);
                  openDatePicker(variantPicker, v.id ?? null);
                }}
                className="flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium hover:border-[#8972FD]"
              >
                <span>{v.nombre}</span>
                <span style={{ color: colors.primary }}>
                  +{formatPrice(Number(v.precio_extra || 0), variantPicker.divisa)}
                </span>
              </button>
            ))}
          </div>
        </ModalShell>
      )}

      {datePicker && (
        <ModalShell onClose={() => setDatePicker(null)} title="¿Para qué día?">
          <div className="space-y-2">
            {datePicker.fechas.map((iso) => (
              <button
                key={iso}
                type="button"
                onClick={() => setDatePicker((d) => (d ? { ...d, selected: iso } : d))}
                className="flex w-full rounded-xl border-2 px-4 py-3 text-sm font-semibold"
                style={{
                  borderColor: datePicker.selected === iso ? colors.primary : colors.border,
                  background: datePicker.selected === iso ? colors.primaryLighter : colors.white,
                }}
              >
                {formatMenuDateLabel(iso)}
              </button>
            ))}
            <button
              type="button"
              onClick={() => void addToCart(datePicker.producto.id, datePicker.varianteId, datePicker.selected)}
              className="mt-2 h-11 w-full rounded-xl font-semibold text-white"
              style={{ background: colors.primary }}
            >
              Agregar · {formatMenuDateLabel(datePicker.selected)}
            </button>
          </div>
        </ModalShell>
      )}
    </div>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button type="button" onClick={onClose} aria-label="Cerrar">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
