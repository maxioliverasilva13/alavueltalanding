# Fixeo Landing

Landing page server-side (Next.js) por subdominio para empresas con plan que incluye `tiene_landing_page`.

## Desarrollo

```bash
cp .env.example .env.local
npm install
npm run dev
```

El servidor corre en el puerto **5001**.

Opciones en desarrollo:

- `http://maxi-pro.localhost:5001` — subdominio desde el host (sin editar `/etc/hosts`)
- `http://maxi-pro.alavueltaapp.pro:5001` — agregá en `/etc/hosts`: `127.0.0.1 maxi-pro.alavueltaapp.pro`
- `http://localhost:5001?subdomain=maxi-pro` — query param de respaldo

## Variables

- `NEXT_PUBLIC_API_URL` — URL del backend (ej. `http://localhost:8000/api`)
- `NEXT_PUBLIC_DEFAULT_SUBDOMAIN` — subdominio por defecto en dev
- `NEXT_PUBLIC_ROOT_DOMAIN` — dominio raíz para subdominios de landing (prod: `alavueltaapp.pro` → `maxi-pro.alavueltaapp.pro`)
- `NEXT_PUBLIC_APP_URL` — app principal (prod: `https://app.alavueltaapp.pro`)
- Firebase (`NEXT_PUBLIC_FIREBASE_*`) — mismo proyecto que `fixeo_FE` (`android/app/google-services.json`):
  - `API_KEY`, `PROJECT_ID`, `STORAGE_BUCKET`, `MESSAGING_SENDER_ID` salen del JSON
  - `AUTH_DOMAIN` = `{PROJECT_ID}.firebaseapp.com`
  - `APP_ID` debe ser el de la **app Web** en Firebase Console (`1:…:web:…`), no el `mobilesdk_app_id` Android

**Google en landings (wildcard):** Firebase no permite `*.alavueltaapp.pro`. El botón de Google abre un popup en `NEXT_PUBLIC_APP_URL` (`/auth/landing-bridge`), hace el login ahí (dominio autorizado) y devuelve los tokens a la landing por `postMessage` sin perder el carrito/reserva.

En Firebase Console → Authentication → Settings → Authorized domains, alcanza con agregar `app.alavueltaapp.pro` (y `localhost` en dev). No hace falta cada subdominio de cliente.

## Producción

Cada empresa con plan Pro (o plan con `tiene_landing_page=true`) y subdominio asignado tendrá su landing en:

`https://{subdomain}.alavueltaapp.pro`

El endpoint público del backend es:

`GET /api/empresas/public/{subdomain}/`
