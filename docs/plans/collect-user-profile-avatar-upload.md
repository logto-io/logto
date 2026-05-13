# Plan: Avatar upload in Collect User Profile (SIE)

## Problem Brief

| Field | Content |
|---|---|
| Problem | Sign-in Experience's "Collect User Profile" step does not support an `avatar` field, so end users cannot upload a profile picture during sign-up / profile fulfillment. Authenticated users also lack a first-class avatar upload path on the Account API. |
| Impact | All tenants that rely on the self-hosted collect-profile flow to capture profile data at sign-up; today the only way to get an avatar into the user record is via social IdP claims. |
| Gap | `CustomProfileFieldType` has no `Avatar` variant; Console's `userAvailableBuiltInFieldKeys` does not include `avatar`; the experience app has no image-upload component and no crop UX; neither the Account API nor the unauthenticated interaction session has a tenant-storage-backed upload endpoint usable for avatars. |
| Constraints | All changes ship behind `isDevFeaturesEnabled`; reuse the existing user-assets storage providers (S3/Azure/GCS); Console must block adding the avatar field when storage is not configured; no changeset until the dev flag is removed. |
| Affected systems | `packages/schemas`, `packages/core`, `packages/console`, `packages/experience` |
| Scope | **Standard**, split into multiple PRs (see PR Breakdown). |

## What Already Exists

- **Custom profile field infrastructure** — `packages/schemas/src/foundations/jsonb-types/custom-profile-fields.ts` defines `CustomProfileFieldType`; `packages/schemas/src/types/custom-profile-fields.ts` defines per-type guards and the discriminated union. **Reuse & extend** with a new `Avatar` variant (lands with the UI PR).
- **Built-in field key list (Console side)** — `packages/console/src/pages/SignInExperience/PageContent/CollectUserProfile/consts.ts` (`userAvailableBuiltInFieldKeys`). **Extend** to include `avatar` (gated by dev flag and storage readiness).
- **User `avatar` column** — `Users` table has `avatar: string` (nullable). The SIE `nameAndAvatarGuard` already treats avatar as URL-or-empty. **Reuse**: writing the avatar URL into `users.avatar` happens through the existing profile-update endpoints (`PATCH /api/my-account` for authenticated users, `POST /api/experience/profile` for the register flow), not through the upload endpoint itself.
- **User-assets storage** — `packages/core/src/utils/storage/{index,s3-storage,azure-storage,google-storage}.ts`; wired via `SystemContext.shared.storageProviderConfig`. The legacy management endpoint `POST /api/user-assets` exists but requires admin/management auth. **Reuse** the storage helpers; **add** Account-API and experience-router endpoints for the two end-user use cases.
- **Console avatar upload (admin-side)** — `packages/console/src/pages/Profile/containers/BasicUserInfoUpdateModal/index.tsx` uses `ImageUploaderField` + `me/user-assets`. `ImageUploader` lives at `packages/console/src/ds-components/Uploader/ImageUploader/index.tsx`. **No cropping**. We will not touch this admin UX — the crop requirement is for the end-user experience app only.
- **User-assets readiness hook (Console)** — `packages/console/src/hooks/use-user-assets-service.ts` already returns `isReady` based on `service-status`. **Reuse** to gate Console UI for the new avatar field.
- **Experience collect-profile page** — `packages/experience/src/pages/Continue/SetExtraProfile/` + `ExtraProfileForm/index.tsx`. Fields are iterated and dispatched by `CustomProfileFieldType`. Submission routes through `fulfillProfile()` → `PATCH /api/experience/profile` with `{ type: 'extraProfile', values }`. **Extend** to handle `Avatar` type with a dedicated component.
- **`nameAndAvatarGuard` already covers `avatar` on `POST /api/experience/profile`** — the existing extraProfile write path already accepts `avatar` as a top-level user column write. No new persistence wiring needed.
- **Account center field control** — `ctx.accountCenter.fields.avatar` already gates whether `avatar` is editable for authenticated users (used by `PATCH /api/my-account`). **Reuse** the same gate on the Account-API upload endpoint.
- **`isDevFeaturesEnabled`** — available in core via `EnvSet.values.isDevFeaturesEnabled`, in experience via `packages/experience/src/constants/env.ts`, and in console via the equivalent constant.

## Domain terms resolved

- **"Collect User Profile"** → the Custom Profile Fields feature exposed under `/sign-in-experience/collect-user-profile` in Console, rendered in the experience app's `Continue` / `SetExtraProfile` route.
- **"Built-in profile field key"** → keys listed in `userAvailableBuiltInFieldKeys`; they map to top-level `UserProfile` / `nameAndAvatarGuard` properties rather than `customData`. `avatar` is already part of `nameAndAvatarGuard` but is not yet in the available-keys list.
- **"User assets service"** → storage abstraction at `packages/core/src/utils/storage`; gated by tenant `storageProviderConfig`; readiness exposed as `GET /api/user-assets/service-status` (admin) and the new `GET /api/my-account/user-assets/service-status` (end-user).

## Approach

1. **API layer first (PR 1, already shipped as PR #8755):** add two tenant-storage-backed upload endpoints scoped to end users. Both return `{ url }` and do **not** mutate the user record — the caller submits the URL through the existing profile write paths.
   - `POST /api/my-account/user-assets` + `GET /api/my-account/user-assets/service-status` for authenticated users (Account API). Guarded by `UserScope.Profile` and the account center `avatar` field control.
   - `POST /api/experience/profile/avatar` for the in-flight register interaction. The user may not exist yet (typical when collecting mandatory extra profile fields), so the upload is scoped to the current interaction session via the interaction id. Restricted to `InteractionEvent.Register`.
2. **Schema + UI together (PR 2):** introduce `CustomProfileFieldType.Avatar` as a first-class custom profile field. Its value is a URL string, persisted via the existing `nameAndAvatarGuard` path on `POST /api/experience/profile`. Enforce `name === 'avatar'` in the guard so only the built-in avatar key can use this type.
3. **Console (PR 2):** add `avatar` to the built-in keys list and allow creating an Avatar profile field. Gate the option with (a) `isDevFeaturesEnabled`, (b) user-assets `isReady`. When storage is not configured, show the option as disabled with an explanatory tooltip + link to storage settings.
4. **Experience (PR 2):** add an `AvatarUploader` component using `react-easy-crop` for square crop + zoom, uploads the cropped Blob to `POST /api/experience/profile/avatar`, and sets the returned URL on the RHF form value. Wire it into `ExtraProfileForm` via the `Avatar` type branch. The URL is then submitted to `POST /api/experience/profile` like any other extraProfile value; `nameAndAvatarGuard` already routes `avatar` to `users.avatar`.
5. **Gate every new surface** (schema variant added to the discriminated union, console option, experience rendering, API routes) behind `isDevFeaturesEnabled` so production + staging stay unchanged until the flag is removed.

## NOT in Scope

- **Auto-mapping `extraProfile.avatar` to `users.avatar` inside a new persistence branch** — superseded. The existing `nameAndAvatarGuard` already handles `avatar` on `POST /api/experience/profile`; introducing a parallel mapping just for the upload endpoint would duplicate persistence logic and prevent callers from previewing/canceling before commit. The upload endpoint deliberately returns only `{ url }`.
- **Changeset (until flag removal)** — deferred to the flag-removal PR per the Experience Library "Changeset strategy for multi-PR features" entry.
- **Admin-side avatar cropping** — `BasicUserInfoUpdateModal` still uses the existing non-cropping uploader; out of scope.
- **Uploading arbitrary user assets from the experience app beyond avatar** — only the avatar endpoint + UX is added.
- **Avatar upload during SignIn / ForgotPassword interactions** — `POST /api/experience/profile/avatar` is restricted to `InteractionEvent.Register`; authenticated users go through `POST /api/my-account/user-assets`.
- **OIDC `picture` claim mapping changes** — `users.avatar` already surfaces as `picture`; no claim-layer changes needed.
- **Sign-in Experience preview in Console** — updating the live preview to render the avatar upload is a nice-to-have; optional in the test plan.
- **SDK / docs updates** — documentation changes accompany the flag-removal PR.

## Alternatives Considered

- **Reuse `CustomProfileFieldType.Url` with built-in key `avatar`.** Rejected: the UX requires upload + cropping, not a text field; keeping it as `Url` forces runtime type-branching in Console and Experience keyed on the field name, which is brittle. Adding a new variant is the idiomatic extension to the existing discriminated union.
- **Have the upload endpoint also write `users.avatar` automatically.** Rejected: mixes "store bytes" with "modify user". An aborted UX leaves a dangling URL or, worse, a written profile field; a re-upload requires a "delete previous URL" path. Returning only `{ url }` and letting the caller commit through the existing profile write path keeps the two operations independent and reversible.
- **One unified `POST /api/experience/user-assets` endpoint instead of an avatar-specific path.** Rejected for v1: the only end-user-facing upload need is avatar; a generic name implies broader scope (file types, lifetime, garbage collection) that isn't justified yet. The avatar-specific path also makes Register-only gating obvious.
- **Upload only after sign-up completes (separate post-sign-in step).** Rejected: the product wants the upload inside collect-profile; adding a separate step breaks the flow and still requires a new endpoint or authenticated call. With the interaction-scoped path, register-time upload works even before the user record exists.
- **Proxy uploads through a signed URL issued by core.** Rejected for v1 — more moving parts; the existing `POST /api/user-assets` already performs buffering + upload server-side, so mirroring that for the two new endpoints keeps the code path consistent.
- **Bundle a generic "image upload" custom field type.** Rejected: the product requirement is avatar-specific, we have a dedicated `users.avatar` column, and a generic image field implies `customData` storage + new rendering rules in the OIDC claim layer.

## Detailed Changes

### Change Group A: Core — end-user upload endpoints — (lands in **PR 1**, already shipped as PR #8755)

- File (new): `packages/core/src/routes/account/user-assets.ts`
  - What:
    1. `GET /api/my-account/user-assets/service-status` returning `{ status: 'ready', allowUploadMimeTypes, maxUploadFileSize }` or `{ status: 'not_configured' }`.
    2. `POST /api/my-account/user-assets` multipart upload, guarded by `UserScope.Profile` and `ctx.accountCenter.fields.avatar === Edit`, validating MIME/size, then uploading via `buildUploadFile` and returning `{ url }`.
  - Object key pattern: `${tenantId}/${userId}/${yyyy/MM/dd}/${standardId(8)}/${originalFilename}`.
  - Both routes are wrapped in `if (!EnvSet.values.isDevFeaturesEnabled) return;` at the top of the registration function.
- File: `packages/core/src/routes/account/index.ts`
  - What: Register `accountUserAssetsRoutes` alongside the other account routes.
- File: `packages/core/src/routes/experience/profile-routes.ts`
  - What: Add `POST /api/experience/profile/avatar` (multipart, single `file` field) inside an `if (EnvSet.values.isDevFeaturesEnabled)` block.
    1. Assert `experienceInteraction.interactionEvent === InteractionEvent.Register` (return `session.invalid_interaction_type` 400 otherwise). Authenticated users should use the Account-API endpoint.
    2. Validate MIME + size with `allowUploadMimeTypes` / `maxUploadFileSize`.
    3. Resolve a key prefix: `experienceInteraction.identifiedUserId ?? "_pending/" + ctx.interactionDetails.jti` so uploads remain interaction-scoped even before the user is created.
    4. Stream to storage via `buildUploadFile`, return `{ url }`.
- Files: `packages/core/src/routes/account/index.openapi.json`, `packages/core/src/routes/experience/profile-routes.openapi.json`
  - What: Document the three new operations (`GetUserAssetsServiceStatus`, `UploadUserAsset`, `UploadAvatar`).

### Change Group B: Schema — new `Avatar` custom profile field type — (lands in **PR 2**, alongside UI)

- File: `packages/schemas/src/foundations/jsonb-types/custom-profile-fields.ts`
  - What: Add `Avatar = 'Avatar'` to `CustomProfileFieldType`.
- File: `packages/schemas/src/types/custom-profile-fields.ts`
  - What:
    1. Add `AvatarProfileField` + `avatarProfileFieldGuard` (base fields, no extra config keys required for v1).
    2. Add the new guard to `customProfileFieldUnionGuard` and `updateCustomProfileFieldDataGuard`.
    3. Enforce `name === 'avatar'` via `z.literal('avatar')` on the `name` field so the type binds only to the built-in avatar key.
    4. Extend `builtInCustomProfileFieldKeys` / related helpers so `avatar` is recognised as a built-in key.
  - Why: a dedicated variant gives Console + Experience a type-based dispatch instead of name-based branching. Schema lives with the UI PR because nothing in PR 1 consumes it.

### Change Group C: Console — allow configuring the avatar built-in field — (lands in **PR 2**)

- `packages/console/src/pages/SignInExperience/PageContent/CollectUserProfile/consts.ts`
  - Add `'avatar'` to `userAvailableBuiltInFieldKeys` (behind `isDevFeaturesEnabled`).
- `packages/console/src/pages/SignInExperience/PageContent/CollectUserProfile/CreateProfileFieldModal/index.tsx`
  - When the user picks `avatar`, force the field type to `Avatar` and show upload-specific help text.
- `packages/console/src/pages/SignInExperience/PageContent/CollectUserProfile/ProfileFieldDetails/ProfileFieldDetailsForm/index.tsx`
  - For `Avatar` type, hide irrelevant config fields (placeholder, minLength, etc.). Keep `required` + `label` + `description`.
- `packages/console/src/pages/SignInExperience/PageContent/CollectUserProfile/index.tsx`
  - Consume `use-user-assets-service`'s `isReady`. If not ready, render the `avatar` option disabled with tooltip "Storage provider is not configured" + link to the tenant's storage settings page.
- Phrases: `packages/phrases/src/locales/en/translation/admin-console/sign-in-exp/collect-user-profile.ts` and matching keys per locale.

### Change Group D: Experience — avatar upload field with crop — (lands in **PR 2**)

- Dependency: `packages/experience/package.json` → add `react-easy-crop`.
- `packages/experience/src/apis/experience/index.ts`
  - Add `uploadAvatar(file: Blob): Promise<{ url: string }>` calling `POST /api/experience/profile/avatar`.
- File (new): `packages/experience/src/components/InputFields/AvatarUploadField/index.tsx`
  - RHF-integrated component:
    1. Empty state shows a placeholder circle + "Upload" button.
    2. On file selection, open a modal hosting `react-easy-crop` (aspect 1, zoom slider).
    3. On confirm, convert the cropped region to a Blob (JPEG, quality 0.92), call `uploadAvatar`, and set the returned URL as the form value.
    4. Allow replace / remove.
  - Edge cases: oversized files (inline error before upload); unsupported MIME (front-end gate matching backend list); upload failure (toast + retry without losing crop state); user cancels mid-upload (`AbortController`).
- `packages/experience/src/pages/Continue/ExtraProfileForm/index.tsx`
  - Branch `if (field.type === CustomProfileFieldType.Avatar) return <AvatarUploadField ... />` ahead of the primitive rendering. Required-field validation reuses `useValidateField` (non-empty string).
- `packages/experience/src/pages/Continue/SetExtraProfile/use-set-extra-profile.ts`
  - No behavioural change — `avatar` flows through `fulfillProfile` as an `extraProfile` key, and the existing `nameAndAvatarGuard` on the server routes it to `users.avatar`.
- Phrases: `packages/phrases-experience/src/locales/en/...` — new keys (upload CTA, cropping instructions, size/type error messages).

### Change Group E: Tests

**PR 1 (shipped):**
- Integration (account): query service status returns `ready` or `not_configured`; upload rejected with `account_center.field_not_editable` when `avatar` is `ReadOnly`; upload reaches storage (returns URL when configured, `storage.not_configured` otherwise).
- Integration (experience): reject non-Register events (`session.invalid_interaction_type`), reject disallowed MIME, confirm Register passes guards and reaches the storage layer.
- Both test suites wrapped in `devFeatureTest.describe` so they only run when `DEV_FEATURES_ENABLED=true`.

**PR 2:**
- Unit: `avatarProfileFieldGuard` accepts `{ type: 'Avatar', name: 'avatar', required: true }` and rejects `name: 'something-else'`; `customProfileFieldUnionGuard` narrows correctly on `type === 'Avatar'`.
- Frontend (experience): `AvatarUploadField` renders placeholder, opens crop modal on file select, calls `uploadAvatar`, and surfaces the returned URL as form value (mock the API).
- Frontend (console): creating an Avatar field in `CreateProfileFieldModal` forces type `Avatar` and disables irrelevant config; option is disabled when `isReady === false`.
- Manual: end-to-end in dev sandbox — configure S3, enable dev flag, add avatar field, run sign-up, confirm `users.avatar` is set and surfaces on `/oidc/me`.

## Data Flow

```
Authenticated user (Account Center)
  │
  ├─(1) GET /api/my-account/user-assets/service-status → { status, mime, max }
  │
  ├─(2) Pick file → (optional crop) → Blob
  │
  ├─(3) POST /api/my-account/user-assets (multipart, profile scope, avatar=Edit)
  │       └─ storage helper.upload → { url }
  │
  └─(4) PATCH /api/my-account body: { avatar: url }   # existing endpoint writes users.avatar

End user (experience app, register flow in progress)
  │
  ├─(1) GET /api/experience/profile → server lists missing fields incl. "avatar"
  │
  ├─(2) Select file → crop modal (react-easy-crop) → Blob
  │
  ├─(3) POST /api/experience/profile/avatar (multipart, Register-only, interaction-scoped)
  │       │
  │       ├─ guard: isDevFeaturesEnabled
  │       ├─ guard: interactionEvent === Register
  │       ├─ guard: storageProviderConfig configured
  │       ├─ validate MIME + size
  │       └─ storage helper.upload(file) → { url }
  │
  ├─(4) Form value = { ..., avatar: url }
  │
  └─(5) POST /api/experience/profile body: { type: 'extraProfile', values }
          └─ nameAndAvatarGuard routes avatar → users.avatar (existing path)

Admin console (builds the field config)
  │
  ├─ use-user-assets-service.isReady → enables/disables the "avatar" option
  └─ Create/edit field modal posts to the existing custom-profile-fields API
```

## Failure Modes

| Codepath | What goes wrong | User sees | Handling | Test? |
|---|---|---|---|---|
| `POST /api/my-account/user-assets` — avatar field not editable | Admin set `avatar: ReadOnly` in account center | `account_center.field_not_editable` 400 | Console upload UI checks the same flag; backend enforces | Integration (PR 1) |
| `POST /api/experience/profile/avatar` — wrong interaction event | Caller invokes during SignIn/ForgotPassword | `session.invalid_interaction_type` 400 | Frontend only mounts on Register; backend enforces | Integration (PR 1) |
| Either endpoint — storage unconfigured | Tenant lacks storage config | 400 with `storage.not_configured` | Console gates the avatar field option; experience hides the field | Integration (PR 1) |
| Either endpoint — oversized file | User selects huge image | 400 `guard.file_size_exceeded` | Client gate matching backend; backend rejects as backup | Integration + frontend |
| Either endpoint — disallowed MIME | User selects non-image | 400 `guard.mime_type_not_allowed` | Client gate + backend reject | Integration + frontend |
| Crop → Blob — browser OOM on huge source | Canvas export fails | Inline error, allow retry | try/catch around canvas export | Frontend (PR 2) |
| `storageProvider.upload` — provider outage | S3 5xx | Toast with retry | Catch → `storage.upload_error` 500 | Integration (mock provider) |
| Register flow with `avatar = ''` submitted | User removed avatar | Persist empty string (clear) | `nameAndAvatarGuard` allows `''`; no special branch | Existing coverage |
| Race: user navigates away mid-upload | Fetch left hanging | — | `AbortController` on unmount | Frontend (PR 2) |
| Pending upload abandoned (user never finishes register) | Object lives in bucket | — | Acceptable for v1 (key prefix is interaction-scoped, can be cleaned by lifecycle policy if needed) | N/A |

## Migration / Rollback

- **Backward compat:** Endpoints are gated by `isDevFeaturesEnabled` and silently absent when the flag is off. Schema additions in PR 2 are additive on the union; disabling the flag hides Console/Experience surfaces.
- **Data migration:** None.
- **Rollback plan:** Revert the PR. Any orphaned objects in tenant storage are harmless (interaction-scoped keys; not referenced by `users.avatar` unless the caller submitted the URL through the profile write path).

## PR Breakdown

This feature ships across **two PRs** instead of one. The split is forced by review size + the API/UI boundary; PR 1's API surface is independently useful for the Account Center flow even before the SIE field exists.

- **PR 1 — APIs (shipped as #8755):** Account-API upload + service status, experience-router avatar upload, OpenAPI updates, integration tests, dev-flag gated. No schema, no UI.
- **PR 2 — Schema + UI:** `CustomProfileFieldType.Avatar`, Console field configuration, experience `AvatarUploadField` with `react-easy-crop`, phrases, unit/frontend tests. Still dev-flag gated.
- **PR 3 (flag removal, later):** flip the flag, add the consolidated changeset, update SDK docs / migration notes.

## Checklist Before Execution

- [x] Step 0 scope challenge completed (reused schemas' discriminated union, Console's built-in keys list, existing storage helpers, existing collect-profile form renderer, existing `nameAndAvatarGuard` write path).
- [x] All edge cases documented (crop OOM, oversized file, storage outage, empty avatar, abandoned upload, race on unmount, wrong interaction event).
- [x] Failure modes analysed with user-visible behavior.
- [x] Error paths specified (dev-flag silent absence, account center field gate, register-only gate, storage 400/500, MIME/size 400, upload failure 500 surfaced as toast).
- [x] Test scenarios listed at unit / integration / frontend / manual levels.
- [x] Experience Library applied: dev-feature gating, no changeset until flag removal, OpenAPI update for new endpoints, multi-PR split documented.
- [ ] Open question to resolve in PR 2: confirm `ky` abort semantics for the experience client's upload call.
- [ ] Open question to resolve in PR 2: confirm rate-limiting middleware on the experience router covers the new upload route; if not, add a dedicated limiter.
