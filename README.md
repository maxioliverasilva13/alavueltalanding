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

## SEO (landings por subdominio)

Cada empresa tiene URL canónica `https://{subdomain}.alavueltaapp.pro` con:

- Metadata (title, description, Open Graph, Twitter, canonical)
- JSON-LD `LocalBusiness` (dirección, geo, horarios, rating, ofertas)
- `robots.txt` y `sitemap.xml` por host

**Para aparecer en Google** (no lo garantiza el código solo):

1. Deploy en HTTPS con el dominio real
2. [Google Search Console](https://search.google.com/search-console) → agregar la propiedad del dominio `alavueltaapp.pro` (o cada subdominio) y pedir indexación de la URL
3. Ideal: perfil de [Google Business Profile](https://business.google.com/) con el mismo nombre/dirección y link a la landing
4. Contenido único: título, slogan y descripción bien cargados en la config de landing

Probar rich results: [Rich Results Test](https://search.google.com/test/rich-results) con la URL pública.
