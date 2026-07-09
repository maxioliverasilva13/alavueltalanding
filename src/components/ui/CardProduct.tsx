"use client";

import { Minus, Package, Plus } from "lucide-react";
import { colors } from "@/lib/colors";
import { formatPrice } from "@/lib/format";

type Props = {
  id: number;
  name: string;
  description?: string;
  photo?: string;
  price: number | string;
  currency: string;
  soldOut?: boolean;
  quantity: number;
  onChangeQuantity: (qty: number) => void;
};

export default function CardProduct({
  name,
  description,
  photo,
  price,
  currency,
  soldOut = false,
  quantity,
  onChangeQuantity,
}: Props) {
  const inCart = quantity > 0;

  return (
    <article
      className={`flex w-full items-stretch overflow-hidden rounded-2xl border bg-white transition-all duration-150 ${
        inCart
          ? "border-[#8972FD] shadow-sm ring-2 ring-[#8972FD]/20"
          : "border-gray-100 hover:border-gray-200 hover:shadow-md"
      } ${soldOut ? "opacity-80" : ""}`}
    >
      <div
        className={`relative aspect-square w-28 min-w-[112px] max-w-[112px] shrink-0 overflow-hidden sm:w-32 sm:min-w-[128px] sm:max-w-[128px] ${
          soldOut ? "bg-red-50" : "bg-gradient-to-br from-gray-50 to-gray-100"
        }`}
      >
        {photo ? (
          <img
            src={photo}
            alt={name}
            loading="lazy"
            className={`h-full w-full object-cover ${soldOut ? "opacity-50 grayscale" : ""}`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package size={28} className="text-gray-300" />
          </div>
        )}
        {soldOut && (
          <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">
            Agotado
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-900">{name}</p>
          {description?.trim() && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">{description}</p>
          )}
          <p className="mt-2 text-base font-bold" style={{ color: colors.primary }}>
            {formatPrice(Number(price), currency)}
          </p>
        </div>

        {!soldOut && (
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-gray-400">
              {inCart ? `${quantity} en el carrito` : "Agregar al carrito"}
            </span>
            <div
              className="inline-flex items-center gap-1 rounded-xl border p-1"
              style={{ borderColor: colors.border, background: colors.background }}
            >
              <button
                type="button"
                onClick={() => onChangeQuantity(Math.max(0, quantity - 1))}
                disabled={quantity === 0}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Quitar uno"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center text-sm font-bold text-gray-900">{quantity}</span>
              <button
                type="button"
                onClick={() => onChangeQuantity(quantity + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-white transition hover:opacity-90"
                style={{ background: colors.primary }}
                aria-label="Agregar uno"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
