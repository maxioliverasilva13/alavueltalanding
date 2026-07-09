import { MapPinOff } from "lucide-react";
import { colors } from "@/lib/colors";

type Props = {
  title?: string;
  description?: string;
};

export default function NotFound({
  title = "Página no encontrada",
  description = "No pudimos encontrar lo que buscás. Verificá la dirección e intentá de nuevo.",
}: Props) {
  return (
    <main
      className="flex min-h-screen items-center justify-center p-6"
      style={{ background: colors.background }}
    >
      <div className="max-w-sm text-center">
        <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
          <div
            className="absolute inset-0 rounded-full opacity-60"
            style={{
              background: `radial-gradient(circle, ${colors.primaryLighter} 0%, transparent 70%)`,
            }}
          />
          <div
            className="relative flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${colors.primaryLighter}, ${colors.white})`,
              border: `1px solid ${colors.border}`,
            }}
          >
            <MapPinOff className="h-8 w-8" style={{ color: colors.primary }} strokeWidth={1.75} />
          </div>
        </div>

        <span
          className="inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-wide"
          style={{ background: colors.primaryLighter, color: colors.primaryDark }}
        >
          404
        </span>

        <h1 className="mt-4 text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-3 text-gray-500 leading-relaxed">{description}</p>

        <p className="mt-8 text-xs text-gray-400">Powered by Fixeo</p>
      </div>
    </main>
  );
}
