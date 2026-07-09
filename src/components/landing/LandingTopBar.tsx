"use client";

import { useCallback, useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import {
  fetchCurrentUser,
  LANDING_AUTH_CHANGED,
  restoreAuthFromStorage,
  type LandingUser,
} from "@/lib/api";

function userDisplayName(user: LandingUser): string {
  return [user.nombre, user.apellido].filter(Boolean).join(" ").trim();
}

export default function LandingTopBar() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const [label, setLabel] = useState("ALaVuelta");

  const refresh = useCallback(async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("landing_token") : null;
    if (!token) {
      setLabel("ALaVuelta");
      return;
    }

    restoreAuthFromStorage();
    const user = await fetchCurrentUser();
    const name = user ? userDisplayName(user) : "";
    setLabel(name || "ALaVuelta");
  }, []);

  useEffect(() => {
    void refresh();
    window.addEventListener(LANDING_AUTH_CHANGED, refresh);
    return () => window.removeEventListener(LANDING_AUTH_CHANGED, refresh);
  }, [refresh]);

  if (!appUrl) return null;

  return (
    <div className="absolute inset-x-0 top-0 z-20 flex justify-end px-4 py-3 md:px-6 md:py-4">
      <a
        href={appUrl}
        className="inline-flex max-w-[min(100%,16rem)] items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-black/45"
        aria-label={label === "ALaVuelta" ? "Ir a ALaVuelta" : `Ir a la app como ${label}`}
      >
        <UserRound className="h-4 w-4 shrink-0" />
        <span className="truncate">{label}</span>
      </a>
    </div>
  );
}
