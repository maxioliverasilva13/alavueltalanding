import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "alavueltaapp.pro";

function extractSubdomain(host: string): string | null {
  const hostWithoutPort = host.split(":")[0].toLowerCase();
  const rootWithoutPort = ROOT_DOMAIN.split(":")[0].toLowerCase();

  if (!hostWithoutPort || hostWithoutPort === rootWithoutPort) {
    return null;
  }

  // Dev sin /etc/hosts: maxi-pro.localhost:5001
  if (hostWithoutPort.endsWith(".localhost")) {
    const sub = hostWithoutPort.slice(0, -".localhost".length);
    return sub && sub !== "www" ? sub : null;
  }

  // Producción o dev con hosts: maxi-pro.alavueltaapp.pro
  if (hostWithoutPort.endsWith(`.${rootWithoutPort}`)) {
    const sub = hostWithoutPort.slice(0, -`.${rootWithoutPort}`.length);
    return sub && sub !== "www" ? sub : null;
  }

  return null;
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const url = request.nextUrl;

  let subdomain = extractSubdomain(host);

  if (!subdomain) {
    subdomain = url.searchParams.get("subdomain");
  }

  if (!subdomain) {
    subdomain = process.env.NEXT_PUBLIC_DEFAULT_SUBDOMAIN || null;
  }

  // Muchos navegadores piden /favicon.ico directo; reescribimos al icon dinámico por empresa.
  if (url.pathname === "/favicon.ico") {
    const rewriteUrl = url.clone();
    rewriteUrl.pathname = "/icon";
    const response = NextResponse.rewrite(rewriteUrl);
    if (subdomain) response.headers.set("x-subdomain", subdomain);
    return response;
  }

  const response = NextResponse.next();
  if (subdomain) {
    response.headers.set("x-subdomain", subdomain);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
