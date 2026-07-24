# TripleEnable · fork de Logto

Fork de [logto-io/logto](https://github.com/logto-io/logto) con dos factores de
autenticación propios: **QR** y **Push a dispositivo**, resueltos por el IdP de
TripleEnable y su wallet (firma Ed25519).

El objetivo de este documento es que **traer cambios de upstream no duela**.

## Convención de marcado

Todo cambio nuestro sobre un archivo de upstream va envuelto en marcadores:

```ts
/* TE:BEGIN <feature> */
…nuestro código…
/* TE:END <feature> */
```

Buscar `TE:BEGIN` en el repo lista el 100% de la superficie del fork.

## Superficie del fork

### Archivos de upstream modificados

Mantener esta lista al día. **Si crece, algo se está haciendo mal**: preferimos
archivos nuevos antes que editar upstream.

| Archivo | Feature | Qué hace |
|---|---|---|
| `packages/experience/src/App.tsx` | `qr-push-factor` | Registra las rutas `sign-in/te-qr` y `sign-in/te-push` |
| `packages/experience/src/containers/SocialSignInList/index.tsx` | `qr-push-factor` | El botón de QR navega a su pantalla; el de push se oculta (vive en la lista de métodos) |
| `packages/experience/src/pages/SignInVerificationMethods/index.tsx` | `qr-push-factor` | Añade TripleEnable a la lista de métodos de verificación |
| `packages/experience/src/components/SwitchToVerificationMethodsLink/index.tsx` | `qr-push-factor` | Cuenta TripleEnable como opción, para que el enlace "probar otro método" aparezca |
| `packages/core/src/middleware/koa-security-headers.ts` | `qr-push-factor` | Añade el origen del IdP al `connect-src` de la CSP de la experiencia (vía `TE_IDP_ORIGIN`) |

### Archivos nuevos (no dan conflicto en merge)

Todo lo nuestro vive aislado bajo `packages/experience/src/te/`:

| Archivo | Qué es |
|---|---|
| `te/config.ts` | Targets de conector → factor, rutas, URL del IdP, timeouts |
| `te/api.ts` | Cliente del IdP TripleEnable (dispositivos + retos de firma) |
| `te/use-te-challenge.ts` | Abre el reto, espera la firma y canjea el one-time token |
| `te/use-te-push-enabled.ts` | Si el conector de push está activo en la consola |
| `te/TeLayout/` | Layout igual que `SecondaryPageLayout` pero con textos propios |
| `te/TeQrPage/` | Pantalla dedicada del QR (como la de passkey) |
| `te/TePushPage/` | Pantalla dedicada del push: selector de dispositivo + number matching |
| `te/TeMethodCard/` | Tarjeta de la lista de métodos, reutilizando los estilos nativos |

### Lo que **no** tocamos

- `packages/core` (lógica de autenticación) — intacto.
- `packages/console` (consola de admin) — intacto.
- `packages/schemas` (enums de factores, migraciones) — intacto.

Por eso los factores se modelan como **conectores**: se activan y desactivan desde la
consola nativa sin forkearla.

## Cómo funciona (resumen)

En la consola se crean dos conectores con `target` `te-qr` y `te-push`. Logto los publica
en `sign-in-exp`, y cada factor aparece donde tiene sentido según lo que necesita saber:

**QR** — no necesita saber quién eres, así que vive en la primera pantalla junto a los
botones sociales. Al pulsarlo se navega a `sign-in/te-qr`, una pantalla dedicada igual
que la de passkey, que muestra el código y espera la firma.

**Push** — necesita saber a qué dispositivos avisar, así que aparece en la lista de
métodos de verificación, una vez el usuario ha escrito su correo, usuario o teléfono.
Lleva a `sign-in/te-push`: elige dispositivo ("iPhone X") y entra en **number matching**,
donde el navegador enseña un número que hay que tocar en el teléfono.

En ambos casos el final es el mismo:

1. El wallet firma el reto con Ed25519.
2. El IdP verifica la firma y **acuña un one-time token de Logto** vía Management API.
3. La SPA canjea ese token con la Experience API nativa
   (`/verification/one-time-token/verify` → `identify` → `submit`), que es lo que crea
   la sesión.

### Number matching

El push no se aprueba a ciegas: el IdP genera un número y dos señuelos, manda los tres al
teléfono y devuelve solo el correcto al navegador. Tocar el equivocado anula el intento.
Es lo que evita que un usuario harto de notificaciones apruebe un login ajeno.

Consecuencia: todos los factores nativos (email, SMS, TOTP, passkey), el MFA y las
políticas de Logto **siguen funcionando sin cambios**; el wallet solo añade una opción más.

## Configuración

**SPA** — dónde vive el IdP. Orden de resolución en `te/config.ts`:

1. `window.__TE_CONFIG__.idpUrl` (inyectado en tiempo de ejecución)
2. `VITE_TE_IDP_URL` (build)
3. `http://localhost:3010` (default de desarrollo)

**Core** — `TE_IDP_ORIGIN` (coma-separado) añade ese origen al `connect-src` de la CSP.
Sin esta variable el navegador bloquea las llamadas al IdP y el panel muestra
"No pudimos contactar con el IdP".

**Consola** — crear dos conectores sociales cuyo `target` sea `te-qr` y `te-push`, y
habilitarlos en el sign-in experience. A partir de ahí se encienden y apagan desde la
consola como cualquier otro conector.

## Probar en local

```bash
# 1. Postgres
docker run -d --name logto-pg -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=p0stgr3s \
  -e POSTGRES_DB=logto -p 5459:5432 postgres:16-alpine

# 2. Logto (desde la raíz del fork)
export DB_URL="postgres://postgres:p0stgr3s@localhost:5459/logto"
export ENDPOINT="http://localhost:3001" ADMIN_ENDPOINT="http://localhost:3002"
export VITE_TE_IDP_URL="http://localhost:3010" TE_IDP_ORIGIN="http://localhost:3010"
pnpm i && pnpm -r prepack && pnpm cli db seed -- --swe && pnpm cli connector link -p .
pnpm start:dev

# 3. IdP (repo demo_idp/global-idp) en el puerto 3010, con las credenciales M2M
#    LOGTO_ENDPOINT / LOGTO_M2M_APP_ID / LOGTO_M2M_SECRET
```

Luego abrir `http://localhost:3001/demo-app`.

## Traer cambios de upstream

```bash
git remote add upstream https://github.com/logto-io/logto.git   # una sola vez
git fetch upstream --tags
git rebase upstream/<tag-de-release>
```

Rebasa sobre **tags de release**, no sobre `main`. Los conflictos solo pueden aparecer
en los archivos de la tabla de arriba; los marcadores `TE:` hacen obvio qué es nuestro.
