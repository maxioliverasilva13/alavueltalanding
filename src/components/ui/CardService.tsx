"use client";

import { Check, Clock, Sparkles } from "lucide-react";
import { colors } from "@/lib/colors";
import { formatDuration, formatPrice } from "@/lib/format";

type Props = {
  id: number;
  name: string;
  description?: string;
  photo?: string;
  price: number | string;
  currency: string;
  timeInMinutes: number;
  selected?: boolean;
  onSelect?: (id: number) => void;
};

export default function CardService({
  id,
  name,
  description,
  photo,
  price,
  currency,
  timeInMinutes,
  selected = false,
  onSelect,
}: Props) {
  return (
    <button
      type="button"
      onClick={() => onSelect?.(id)}
      className={`group flex w-full items-stretch overflow-hidden rounded-xl border bg-white text-left transition-all duration-150 ${
        selected
          ? "border-[#8972FD] ring-2 ring-[#8972FD]/30 shadow-sm"
          : "border-gray-100 hover:border-gray-200 hover:shadow-md"
      }`}
    >
      <div className="flex aspect-square w-24 min-w-[96px] max-w-[96px] shrink-0 items-center justify-center overflow-hidden rounded-l-2xl bg-gradient-to-br from-gray-50 to-gray-100">
        {photo ? (
          <img src={photo} alt={name} className="h-full w-full object-cover" />
        ) : (
          <Sparkles size={22} className="text-gray-300" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 items-center">
        <div className="min-w-0 flex-1 px-4 py-3">
          <p className="truncate text-sm font-semibold leading-5 text-gray-900">{name}</p>
          <p className="mt-0.5 line-clamp-2 text-xs leading-4 text-gray-400">
            {description || "Sin descripción disponible"}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <span className="text-sm font-bold text-[#7F77DD]">{formatPrice(Number(price), currency)}</span>
            <span className="text-gray-200">|</span>
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="text-[#7F77DD]" />
              <span className="text-xs font-medium text-gray-500">{formatDuration(timeInMinutes)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center pr-4">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors ${
              selected ? "border-[#8972FD] bg-[#8972FD] text-white" : "border-gray-200 bg-white text-transparent"
            }`}
          >
            <Check size={14} strokeWidth={3} />
          </div>
        </div>
      </div>
    </button>
  );
}

export function CardHour({
  label,
  selected,
  disabled,
  onClick,
}: {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`relative flex flex-row items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all ${
        selected ? "text-white" : "border-gray-300 text-gray-600"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      style={
        selected
          ? { background: colors.primary, borderColor: colors.primary }
          : undefined
      }
    >
      {disabled && (
        <span className="absolute left-1/2 top-1/2 h-0.5 w-4/5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gray-300" />
      )}
      {label}
    </button>
  );
}
