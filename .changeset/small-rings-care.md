---
"@logto/console": minor
---

introduce tenant settings page and migrate signing key configs to oidc settings

- Added a new tenant-level **Settings** page in OSS, accessible from the left menu: **Tenant -> Settings**.
- Deprecated and removed the original **Signing keys** page.
- Added a new **OIDC settings** tab under **Tenant -> Settings** for managing tenant-level OIDC configurations.
- Migrated signing key configurations from the old page to **Settings -> OIDC settings**.
- Added a new **Session maximum time to live** field to configure tenant-level session TTL in days (default: `14`).
- Note: this console field uses days for input/display, while the underlying OIDC session TTL config/API uses seconds.
