---
name: logto-local-storage
description: Configure local object storage for Logto user-asset uploads (MinIO as S3). Use when you see storage.not_configured, avatar upload, POST user-assets/avatar, Console image upload, collect user profile avatar field, or need MinIO/S3 for dev.
---

# Logto local storage (user assets)

## When to use

- Avatar upload during sign-up (collect user profile) or Account Center
- Console / Management API `POST …/user-assets`
- `GET /api/user-assets/service-status` returns `not_configured`
- Console blocks adding the **avatar** built-in collect-profile field

**Not needed** for ordinary API or UI work that does not upload files.

## Prerequisites

- [Development environment](../../../AGENTS.md#starting-the-development-environment) running (`pnpm start:dev`, Postgres, `DB_URL`)
- Docker available for MinIO

## Quick path

1. Read [MinIO setup commands](references/minio-setup.md) and run them.
2. **Restart** `pnpm start:dev` (Core loads `systems.storageProvider` only at startup).
3. Verify: `curl -s -H 'development-user-id: dev' http://localhost:3001/api/user-assets/service-status` → `"status":"ready"`.

## How it works

- Config lives in PostgreSQL `systems` table, `key = 'storageProvider'` (JSON).
- Runtime: `SystemContext` → `buildUploadFile()` → Azure / GCS / **S3** (`packages/core/src/utils/storage/`).
- There is **no in-process mock**; CI usually asserts `storage.not_configured` only.

## Providers

| `provider` | Use case |
|------------|----------|
| `S3Storage` | AWS S3 or S3-compatible (**MinIO** for local dev) |
| `AzureStorage` | Azure Blob |
| `GoogleStorage` | GCS |

If screenshots need a specific sign-in experience, configure SIE via [logto-dev-environment](../logto-dev-environment/SKILL.md) separately.

## Troubleshooting

| Symptom | Check |
|---------|--------|
| Still `not_configured` after SQL | Restarted core? Correct `DB_URL` / tenant DB? |
| Upload 500 | MinIO running? Bucket exists? `forcePathStyle: true` for MinIO? |
| Image URL 404 in browser | `publicUrl` must be reachable from the **browser** host (not only from Core) |

Full commands and JSON template: [references/minio-setup.md](references/minio-setup.md).
