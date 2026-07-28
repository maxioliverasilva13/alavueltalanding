"use client";

/**
 * Login Google vía popup en la app principal (dominio autorizado en Firebase).
 * La landing no hace Firebase localmente → no hace falta whitelistear cada subdominio.
 */

import { LANDING_AUTH_MESSAGE_TYPE } from "./landing-auth-protocol";

export type BridgeTokens = { access: string; refresh: string };

type BridgeSuccess = {
  type: typeof LANDING_AUTH_MESSAGE_TYPE;
  ok: true;
  tokens: BridgeTokens;
};

type BridgeFailure = {
  type: typeof LANDING_AUTH_MESSAGE_TYPE;
  ok: false;
  error?: string;
  isNewUser?: boolean;
};

function appOrigin(): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!appUrl) throw new Error("Falta NEXT_PUBLIC_APP_URL (app principal para Google).");
  return new URL(appUrl).origin;
}

function bridgeUrl(landingOrigin: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!.replace(/\/$/, "");
  const url = new URL(`${appUrl}/auth/landing-bridge`);
  url.searchParams.set("origin", landingOrigin);
  return url.toString();
}

export function loginWithGoogleViaAppBridge(): Promise<BridgeTokens> {
  const expectedOrigin = appOrigin();
  const landingOrigin = window.location.origin;
  const url = bridgeUrl(landingOrigin);

  return new Promise((resolve, reject) => {
    const width = 520;
    const height = 680;
    const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2);
    const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2);
    const popup = window.open(
      url,
      "alavuelta-landing-google",
      `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
    );

    if (!popup) {
      reject(
        new Error(
          "El navegador bloqueó la ventana emergente. Permití popups para continuar con Google."
        )
      );
      return;
    }

    let settled = false;

    const cleanup = () => {
      window.removeEventListener("message", onMessage);
      window.clearInterval(closedPoll);
    };

    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      cleanup();
      fn();
    };

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== expectedOrigin) return;
      const data = event.data as BridgeSuccess | BridgeFailure | null;
      if (!data || data.type !== LANDING_AUTH_MESSAGE_TYPE) return;

      if (data.ok === true && data.tokens?.access) {
        try {
          popup.close();
        } catch {
          /* ignore */
        }
        settle(() => resolve(data.tokens));
        return;
      }

      settle(() =>
        reject(
          new Error(
            data.ok === false
              ? data.error || "No se pudo iniciar sesión con Google."
              : "No se pudo iniciar sesión con Google."
          )
        )
      );
    };

    const closedPoll = window.setInterval(() => {
      if (!popup.closed) return;
      settle(() => reject(new Error("Login cancelado.")));
    }, 400);

    window.addEventListener("message", onMessage);
  });
}
