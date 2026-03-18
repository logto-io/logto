# Copilot Instructions for Logto

Logto is an open-source identity and access management platform (OIDC/OAuth 2.1/SAML) with multi-tenancy, built as a pnpm monorepo.

## Prerequisites

- Node.js ^22.14.0, pnpm ^9.0.0 || ^10.0.0, PostgreSQL ^14.0

## Build, Lint, and Test Commands

### Root-level commands

```bash
pnpm i && pnpm prepack         # Install deps + build workspace packages (required first time)
pnpm dev                        # Start all packages in parallel with watch mode
pnpm ci:build                   # Build all packages
pnpm ci:lint                    # ESLint all packages in parallel
pnpm ci:stylelint               # Stylelint all SCSS in parallel
pnpm ci:test                    # Run all tests with coverage
```

### Per-package commands

Run from the package directory, or from root with `pnpm --filter <package> <script>`.

**Core (backend):**

```bash
pnpm build                      # tsup bundle
pnpm dev                        # tsup watch mode
pnpm test                       # Build for test + run Jest
pnpm test:only                  # Run Jest without rebuilding
pnpm test:only -- --testPathPattern='user' # Run a single test file by pattern
pnpm lint                       # ESLint
```

**Console / Experience / Account (React SPAs):**

```bash
pnpm build                      # Vite build
pnpm dev                        # Vite dev server
pnpm test                       # Jest
pnpm test -- --testPathPattern='hook' # Run a single test file by pattern
pnpm lint                       # ESLint
pnpm stylelint                  # Stylelint SCSS
```

**Schemas:**

```bash
pnpm build                      # Generate types + compile + build alterations
pnpm test                       # Vitest
pnpm test -- src/path/to/file   # Run a single test file
```

**Integration tests** (requires running Logto instance + Postgres):

```bash
pnpm build && pnpm test:api     # API integration tests
pnpm test:experience            # UI experience tests
pnpm test:console               # Console UI tests
```

### Database management

```bash
pnpm cli db seed                # Seed database (requires DB_URL in .env)
pnpm alteration deploy          # Deploy pending schema migrations
```

## Architecture

### Monorepo structure

This is a **pnpm workspace** monorepo (no Turborepo/Nx). Workspaces are defined in `pnpm-workspace.yaml`: `packages/*`, `packages/toolkit/*`, and `packages/connectors/*`.

### Core packages

- **`packages/core`** — Koa-based backend server: OIDC provider, REST API, multi-tenancy router. Uses `@silverhand/slonik` for type-safe PostgreSQL queries, `koa-router` for routing, and `zod` for request/response validation.
- **`packages/console`** — React 18 admin SPA (Vite, SCSS modules, React Hook Form, SWR for data fetching). See `packages/console/CONVENTION.md` for UI component organization rules.
- **`packages/experience`** — React 18 end-user sign-in/register SPA (Vite, SCSS modules). Runs within OIDC interaction flow context.
- **`packages/account`** — React 18 account center SPA.
- **`packages/schemas`** — Single source of truth for database table definitions (SQL in `tables/`), TypeScript types, Zod guards, and migration scripts (`alterations/`).
- **`packages/phrases`** / **`packages/phrases-experience`** — i18n translation strings (18+ languages).
- **`packages/cli`** — CLI for database setup, migrations, and connector management.

### Toolkit (shared libraries)

- **`@logto/connector-kit`** — Interfaces and utilities all connectors must implement.
- **`@logto/core-kit`** — OIDC scope/claim constants, shared types.
- **`@logto/language-kit`** — Language tag definitions and metadata.
- **`@logto/shared`** — Cross-package utilities.

### Connectors (50+)

Each connector in `packages/connectors/` implements `SocialConnector`, `EmailConnector`, or `SmsConnector` from `@logto/connector-kit`. Connector `package.json` files are auto-synced from `packages/connectors/templates/` on install — don't edit shared fields directly in individual connectors.

### Backend (core) architecture

```
packages/core/src/
├── routes/          # API endpoints (receive router + TenantContext)
├── middleware/       # Koa middleware (auth, validation, audit, error handling)
├── libraries/       # Business logic services (scoped per tenant)
├── queries/         # Database query builders (Slonik SQL templates)
├── tenants/         # Multi-tenant context (Tenant, TenantContext, Libraries, Queries)
├── oidc/            # OIDC provider configuration
└── database/        # Low-level DB utilities (insert-into, update-where, etc.)
```

**Request flow:** Route → `koa-guard` middleware (Zod validation) → handler → library → query → Slonik/PostgreSQL.

**Multi-tenancy:** Domain-based tenant routing. Each tenant gets isolated context with its own libraries, queries, and OIDC provider instance.

### Database schema system

SQL table definitions live in `packages/schemas/tables/*.sql`. Init order is controlled by `/* init_order = N */` comments. Lifecycle hooks: `_before_all.sql`, `_after_all.sql`, `_after_each.sql`.

**Migrations** (alterations) in `packages/schemas/alterations/` are versioned files (e.g., `1.37.0-1768758295-add-user-geo-location.ts`). They support bidirectional `up`/`down` operations. Deploy with `pnpm alteration deploy`.

### Frontend SPA architecture

Both console and experience follow this pattern:

- `src/pages/` — Route-matched page components
- `src/components/` — Shared business components
- `src/hooks/` — Custom React hooks
- `src/contexts/` or `src/Providers/` — React context providers
- Path alias: `@/` maps to `src/`
- Styling: SCSS modules (`.module.scss`)

## Key Conventions

### Commit messages

Conventional Commits enforced via commitlint. Allowed types: standard conventional types plus `api` and `release`. Scopes: `connector`, `console`, `core`, `experience`, `schemas`, `phrases`, `cli`, `toolkit`, `elements`, `account`, `shared`, `deps`, `deps-dev`, `test`, `translate`, `tunnel`, `account-elements`, `demo-app`, `experience-legacy`, `cloud`, `app-insights`, `api`. Header max 110 chars in CI.

### API route pattern (core)

Routes use `koa-guard` for Zod-based request/response validation. Route functions receive `(router, tenantContext)`. Router types: `AnonymousRouter`, `ManagementApiRouter`, `UserRouter`. OpenAPI docs are co-located as `.openapi.json` files alongside route files.

### Database queries (core)

Use `@silverhand/slonik` SQL template literals — never string concatenation. Queries return fully typed results. Pattern: `pool.one<Type>(sql\`SELECT ...\`)`.

### Console UI conventions (packages/console/CONVENTION.md)

- `ds-components/` for design system components, `components/` for business components.
- Flatten sub-pages in the parent page folder. Use `tabs/`, `hooks/`, `utils/` subfolders for complex pages.
- Page-specific components go in that page's `components/` subfolder.
- Use a folder when a component has more than one file (e.g., `index.tsx` + `index.module.scss`).
- Always fetch remote data before initializing React Hook Form (`useForm({ defaultValues: data })`).
- Convert nullable backend fields to empty values before setting as form defaults to avoid false dirty states.

### i18n (phrases)

Translation keys must not contain dots (`.`) — they break custom phrase editing in the console. English (`en`) is the default/fallback language.

### Silverhand ecosystem

This repo uses `@silverhand/*` packages for shared config: `eslint-config`, `eslint-config-react`, `ts-config`, `ts-config-react`, `slonik`, `essentials`. Don't add competing configs.

### Module system

All packages use ESM (`"type": "module"`). Internal cross-package references use `workspace:^`. Published packages are versioned via Changesets — core packages (`@logto/core`, `@logto/api`, `@logto/cli`, `@logto/create`, `@logto/schemas`) are released as a fixed group.

### Linting

ESLint with `@silverhand/eslint-config` (backend) or `@silverhand/eslint-config-react` (frontend). Stylelint for SCSS. Both auto-fix on pre-commit via lint-staged + husky.
