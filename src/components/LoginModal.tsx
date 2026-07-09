"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import axios from "axios";
import { loginWithGoogle } from "@/lib/firebase";
import { emailLogin, persistLoginTokens, socialLogin } from "@/lib/api";
import { colors } from "@/lib/colors";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

function loginErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined;
    if (typeof data?.message === "string" && data.message.trim()) return data.message;
    if (typeof data?.error === "string" && data.error.trim()) return data.error;
  }
  if (error instanceof Error && error.message) return error.message;
  return "Error al iniciar sesión";
}

export default function LoginModal({ open, onClose, onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const finishLogin = (tokens?: { access?: string; refresh?: string }) => {
    if (!persistLoginTokens(tokens)) {
      setError("No se pudo iniciar sesión. ¿Tenés cuenta en la app?");
      return false;
    }
    onSuccess();
    onClose();
    return true;
  };

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await emailLogin({ correo: email.trim(), password });
      finishLogin(response?.tokens);
    } catch (e: unknown) {
      setError(loginErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setSocialLoading(true);
    setError("");
    try {
      const cred = await loginWithGoogle();
      const response = await socialLogin({
        firebase_token: cred.firebaseToken,
        email: cred.email,
        nombre: cred.nombre,
        foto_url: cred.foto_url,
      });
      finishLogin(response?.tokens);
    } catch (e: unknown) {
      setError(loginErrorMessage(e));
    } finally {
      setSocialLoading(false);
    }
  };

  const isDisabled = !email.trim() || !password || loading || socialLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-gray-900">Iniciá sesión para continuar</h2>
        <p className="mt-2 text-sm text-gray-500">
          Necesitamos tu cuenta para confirmar la reserva u orden.
        </p>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <form onSubmit={handleEmailLogin} className="mt-6 space-y-4">
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 w-full rounded-xl border border-gray-200 bg-[#F5F3FF] pl-10 pr-3 text-sm text-gray-900 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-xl border border-gray-200 bg-[#F5F3FF] pl-10 pr-10 text-sm text-gray-900 outline-none transition focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isDisabled}
            className="flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background: isDisabled
                ? "#D1D5DB"
                : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryLight} 100%)`,
            }}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              "Iniciar sesión"
            )}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs font-medium text-gray-400">O continuar con</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          type="button"
          disabled={loading || socialLoading}
          onClick={handleGoogle}
          className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-gray-200 font-semibold text-gray-800 transition hover:bg-gray-50 disabled:opacity-60"
        >
          {socialLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt=""
                className="h-5 w-5"
              />
              Continuar con Google
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full py-2 text-sm text-gray-500 hover:text-gray-700"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
