# Plan: Avatar upload in Collect User Profile (SIE)

## Problem Brief

| Field | Content |
|---|---|
| Problem | Sign-in Experience's "Collect User Profile" step does not support an `avatar` field, so end users cannot upload a profile picture during sign-up / profile fulfillment. |
| Impact | All tenants that rely on the self-hosted collect-profile flow to capture profile data at sign-up; today the only way to get an avatar into the user record is via social IdP claims. |
| Gap | `CustomProfileFieldType` has no `Avatar` variant; Console's `userAvailableBuiltInFieldKeys` does not include `avatar`; the experience app has no image-upload component and no crop UX; the experience API has no file-upload endpoint for the unauthenticated interaction session. |
| Constraints | All changes ship behind `isDevFeaturesEnabled`; reuse the existing user-assets storage providers (S3/Azure/GCS); Console must block adding the avatar field when storage is not configured; no changeset in this PR (changeset lands when the dev flag is removed). |
| Affected systems | `packages/schemas`, `packages/core`, `packages/console`, `packages/experience` |
| Scope | **Standard** |

## What Already Exists

- **Custom profile field infrastructure** — `packages/schemas/src/foundations/jsonb-types/custom-profile-fields.ts` defines `CustomProfileFieldType`; `packages/schemas/src/types/custom-profile-fields.ts` defines per-type guards and the discriminated union. **Reuse & extend** with a new `Avatar` variant.
- **Built-in field key list (Console side)** — `packages/console/src/pages/SignInExperience/PageContent/CollectUserProfile/consts.ts` (`userAvailableBuiltInFieldKeys`). **Extend** to include `avatar` (gated by dev flag and storage readiness).
- **User `avatar` column** — `Users` table has `avatar: string` (nullable). The SIE `nameAndAvatarGuard` (`packages/schemas/src/types/custom-profile-fields.ts:262`) already treats avatar as URL-or-empty. **Reuse** for persistence; the Avatar field will write to this column, not to `customData`.
- **User-assets storage** — `packages/core/src/utils/storage/{index,s3-storage,azure-storage,google-storage}.ts`; wired via `SystemContext.shared.storageProviderConfig`. `GET /api/user-assets/service-status` and `POST /api/user-assets` already exist but require `ctx.auth.id`. **Reuse** the storage helpers; **add** a new anonymous-but-session-gated endpoint for the interaction context.
- **Console avatar upload (admin-side)** — `packages/console/src/pages/Profile/containers/BasicUserInfoUpdateModal/index.tsx` uses `ImageUploaderField` + `me/user-assets`. `ImageUploader` lives at `packages/console/src/ds-components/Uploader/ImageUploader/index.tsx`. **No cropping**. We will not touch this admin UX — the crop requirement is for the end-user experience app only.
- **User-assets readiness hook (Console)** — `packages/console/src/hooks/use-user-assets-service.ts` already returns `isReady` based on `service-status`. **Reuse** to gate Console UI for the new avatar field.
- **Experience collect-profile page** — `packages/experience/src/pages/Continue/SetExtraProfile/` + `ExtraProfileForm/index.tsx`. Fields are iterated and dispatched by `CustomProfileFieldType`. Submission routes through `fulfillProfile()` (`packages/experience/src/apis/experience/index.ts:160`) → `PATCH /api/experience/profile` with `{ type: 'extraProfile', values }`. **Extend** to handle `Avatar` type with a dedicated component.
- **Profile write path (core)** — `packages/core/src/routes/experience/profile-routes.ts` persists `extraProfile` values to `customData` and/or mapped user columns. The avatar built-in key needs to be mapped to the `users.avatar` column (same pattern `name` already uses).
- **`isDevFeaturesEnabled`** — available in core via `EnvSet.values.isDevFeaturesEnabled`, in experience via `packages/experience/src/constants/env.ts`, and in console via the equivalent constant.

## Domain terms resolved

- **"Collect User Profile"** → the Custom Profile Fields feature exposed under `/sign-in-experience/collect-user-profile` in Console, rendered in the experience app's `Continue` / `SetExtraProfile` route. Verified by reading `consts.ts` and `ExtraProfileForm/index.tsx`.
- **"Built-in profile field key"** → keys listed in `userAvailableBuiltInFieldKeys`; they map to top-level `UserProfile` / `nameAndAvatarGuard` properties rather than `customData`. `avatar` is already part of `nameAndAvatarGuard` but is not in the available-keys list.
- **"User assets service"** → storage abstraction at `packages/core/src/utils/storage`; gated by tenant `storageProviderConfig`; readiness exposed as `GET /api/user-assets/service-status`.

## Approach

1. Introduce `CustomProfileFieldType.Avatar` as a first-class custom profile field. Its value is a URL string, persisted to the user's top-level `avatar` column (not `customData`). Enforce `name === 'avatar'` in the guard so only the built-in avatar key can use this type.
2. In Console, add `avatar` to the built-in keys list and allow creating an Avatar profile field. Gate the option with (a) `isDevFeaturesEnabled`, (b) user-assets `isReady` from `use-user-assets-service`. When storage is not configured, show the option as disabled with an explanatory tooltip + link to storage settings.
3. In core, add a new experience-router endpoint `POST /api/experience/user-assets` that validates the interaction session, checks `storageProviderConfig`, and reuses the storage helpers to upload the file. Response shape matches the existing management endpoint (`{ url }`).
4. In the experience app, add an `AvatarUploader` component that uses `react-easy-crop` for square crop + zoom, uploads the cropped Blob to the new endpoint, and sets the returned URL on the RHF form value. Wire it into `ExtraProfileForm` via the `Avatar` type branch.
5. Persist the avatar: extend `profile-routes.ts` so that when an `extraProfile.avatar` value is present it is written to `users.avatar` (keeping non-avatar custom fields' persistence intact).
6. Gate every new surface (schema variant added to the discriminated union, console option, experience rendering, API route, persistence branch) behind `isDevFeaturesEnabled` so production + staging stay unchanged until the flag is removed.

## NOT in Scope

- **Changeset** — deferred to the flag-removal PR per the Experience Library "Changeset strategy for multi-PR features" entry.
- **Admin-side avatar cropping** — `BasicUserInfoUpdateModal` still uses the existing non-cropping uploader; out of scope for this PR.
- **Uploading arbitrary user assets from the experience app beyond avatar** — only the avatar endpoint + UX is added. Generalising to arbitrary image custom fields is deferred.
- **OIDC `picture` claim mapping changes** — `users.avatar` already surfaces as `picture`; no claim-layer changes needed.
- **Sign-in Experience preview in Console** — updating the live preview to render the avatar upload is a nice-to-have; flagged as optional in the test plan.
- **SDK / docs updates** — documentation changes accompany the flag-removal PR, not this one.

## Alternatives Considered

- **Reuse `CustomProfileFieldType.Url` with built-in key `avatar`.** Rejected: the UX requires upload + cropping, not a text field; keeping it as `Url` forces runtime type-branching in Console and Experience keyed on the field name, which is brittle. Adding a new variant is the idiomatic extension to the existing discriminated union.
- **Upload only after sign-up completes (separate post-sign-in step).** Rejected: the user explicitly wants the upload inside collect-profile; adding a separate step breaks the flow and still requires a new endpoint or authenticated call.
- **Proxy uploads through a signed URL issued by core.** Rejected for v1 — more moving parts; the existing `/api/user-assets` already performs buffering + upload server-side, so mirroring that for the experience endpoint keeps the code path consistent.
- **Bundle a generic "image upload" custom field type.** Rejected: the product requirement is avatar-specific, we have a dedicated `users.avatar` column, and a generic image field implies `customData` storage + new rendering rules in the OIDC claim layer.

## Detailed Changes

### Change Group 1: Schema — new `Avatar` custom profile field type

- File: `packages/schemas/src/foundations/jsonb-types/custom-profile-fields.ts`
  - What: Add `Avatar = 'Avatar'` to `CustomProfileFieldType`.
  - Why: Required by the discriminated union so experience + console can render a dedicated component.
  - Edge cases: Existing rows will not contain this value; enum widening is additive and safe.
- File: `packages/schemas/src/types/custom-profile-fields.ts`
  - What:
    1. Add `AvatarProfileField` type + `avatarProfileFieldGuard` (base fields, optional `config` for allowed MIME types / max size placeholders, no extra keys required for v1).
    2. Add the new guard to `customProfileFieldUnionGuard` and `updateCustomProfileFieldDataGuard`.
    3. Enforce `name === 'avatar'` inside `avatarProfileFieldGuard` via `z.literal('avatar')` on the `name` field, so the type cannot be bound to any other built-in or custom key.
    4. Extend `builtInCustomProfileFieldKeys` / related helpers so `avatar` is recognised as a built-in key (currently only `name` and `profile.*` paths are).
  - Why: Locks the new type to its dedicated built-in key and keeps validation centralized.
  - Edge cases: Ensure the guard is added **behind `isDevFeaturesEnabled`** on the server's accept list — or, if the union is reused in both places, keep the union unconditional but reject the type at route level when the flag is off (decision: reject at the route layer, because zod unions are easier to maintain as a single source of truth).

### Change Group 2: Core — experience-side upload endpoint

- File: `packages/core/src/routes/experience/profile-routes.ts` (or a new sibling `packages/core/src/routes/experience/user-assets-routes.ts` wired in from `experience/index.ts`)
  - What: Add `POST /api/experience/user-assets` (multipart/form-data, single `file` field).
    1. Guard with `EnvSet.values.isDevFeaturesEnabled`; return 404 otherwise.
    2. Require a live `experienceInteraction` (the existing middleware chain guarantees it).
    3. Assert `SystemContext.shared.storageProviderConfig` is configured; return 501 `storage.not_configured` otherwise (match the existing management route's error code).
    4. Validate MIME type + size using the same `allowUploadMimeTypes` / `maxUploadFileSize` constants from `packages/schemas/src/types/user-assets.ts`.
    5. Stream the file to the storage helper; return `{ url }`.
  - Why: Interaction sessions are unauthenticated but anchored to `experienceInteraction`, so the endpoint must live on the experience router.
  - Edge cases: Unfinished interaction (no user yet); size overflow; unsupported MIME; provider outage. For each, emit structured errors matching existing codes. Rate-limit reuse: the experience router already shares rate-limiting middleware — confirm during execution.
- File: `packages/core/src/routes/experience/experience.openapi.json`
  - What: Document the new endpoint (per Experience Library "API changes require OpenAPI doc updates").
- File: `packages/core/src/routes/experience/index.ts`
  - What: Register the new route (call the new function after `profileRoutes`).

### Change Group 3: Core — persist avatar built-in key to `users.avatar`

- File: `packages/core/src/routes/experience/profile-routes.ts` (profile-submission handler) and/or the class that consumes `extraProfile` (e.g. `ExperienceInteraction.setExtraProfile`).
  - What: When `extraProfile.avatar` is present, route the value to the `users.avatar` column (keep the rest in `customData` as today). Mirror how `name` is already handled.
  - Why: The avatar must surface in `users.avatar` so OIDC `picture` claim + downstream APIs see it, rather than being buried in `customData`.
  - Edge cases: Empty string should clear the column (consistent with `nameAndAvatarGuard`); overly long URL should be rejected by the existing `Users` guard.

### Change Group 4: Console — allow configuring the avatar built-in field

- File: `packages/console/src/pages/SignInExperience/PageContent/CollectUserProfile/consts.ts`
  - What: Add `'avatar'` to `userAvailableBuiltInFieldKeys` (behind `isDevFeaturesEnabled`).
- File: `packages/console/src/pages/SignInExperience/PageContent/CollectUserProfile/CreateProfileFieldModal/index.tsx` (and any sub-components that render the built-in key picker)
  - What: When the user picks `avatar`, force the field type to `Avatar` (no other choice) and show the upload-specific help text.
- File: `packages/console/src/pages/SignInExperience/PageContent/CollectUserProfile/ProfileFieldDetails/ProfileFieldDetailsForm/index.tsx`
  - What: For `Avatar` type, hide irrelevant config fields (placeholder, minLength, etc.). Keep `required` + `label` + `description`.
- File: `packages/console/src/pages/SignInExperience/PageContent/CollectUserProfile/index.tsx` (or the list/menu surface that offers adding a built-in key)
  - What: Consume `use-user-assets-service`'s `isReady`. If not ready, render the `avatar` option disabled with tooltip "Storage provider is not configured" and a link to the tenant's storage settings page.
- Phrases: `packages/phrases/src/locales/en/translation/admin-console/sign-in-exp/collect-user-profile.ts` and the matching keys in every other locale.
  - What: Add the two or three new strings (option label, unavailable tooltip, type description). Other locales get the English copy as a placeholder until Phrase pulls translations.

### Change Group 5: Experience — avatar upload field with crop

- Dependency: `packages/experience/package.json` → add `react-easy-crop`.
- File: `packages/experience/src/apis/experience/index.ts`
  - What: Add `uploadAvatar(file: Blob): Promise<{ url: string }>` calling `POST /api/experience/user-assets`.
- File (new): `packages/experience/src/components/InputFields/AvatarUploadField/index.tsx`
  - What: RHF-integrated component. Flow:
    1. Empty state shows a placeholder circle + "Upload" button.
    2. On file selection, open a modal hosting `react-easy-crop` (aspect 1, zoom slider).
    3. On confirm, convert the cropped region to a Blob (JPEG, quality 0.92), call `uploadAvatar`, and set the returned URL as the form value.
    4. Allow replace / remove.
  - Edge cases: Oversized files (show inline error before upload); unsupported MIME (front-end gate using the same list as backend); upload failure (toast + allow retry without losing crop state); user cancels mid-upload (abort via `AbortController`).
- File: `packages/experience/src/pages/Continue/ExtraProfileForm/index.tsx`
  - What: Add a branch `if (field.type === CustomProfileFieldType.Avatar) return <AvatarUploadField ... />` ahead of the primitive rendering. Required-field validation reuses `useValidateField` (non-empty string).
- File: `packages/experience/src/pages/Continue/SetExtraProfile/use-set-extra-profile.ts`
  - What: No behavioural change — values already flow through `fulfillProfile` as an `extraProfile` dict; `avatar` is just another key. Verify.
- Phrases: `packages/phrases-experience/src/locales/en/...` — new keys (upload CTA, cropping instructions, size/type error messages).

### Change Group 6: Tests

- Unit: `avatarProfileFieldGuard` accepts `{ type: 'Avatar', name: 'avatar', required: true }` and rejects `name: 'something-else'`.
- Unit: `customProfileFieldUnionGuard` correctly narrows to Avatar when `type === 'Avatar'`.
- Integration (core): `POST /api/experience/user-assets`
  - 404 when `isDevFeaturesEnabled` is false.
  - 501 when storage provider is not configured.
  - 201 + `{ url }` when configured and file is valid.
  - 400 for unsupported MIME / size.
- Integration (core): profile submission with `extraProfile.avatar` sets `users.avatar` and leaves `customData` unchanged.
- Frontend (experience): `AvatarUploadField` renders placeholder, opens crop modal on file select, calls `uploadAvatar`, and surfaces the returned URL as form value (mock the API).
- Frontend (console): creating an Avatar field in `CreateProfileFieldModal` forces the type to `Avatar` and disables irrelevant config; option is disabled when `isReady === false`.
- Manual: end-to-end in dev sandbox — configure S3, enable dev flag, add avatar field, run sign-up, confirm avatar is visible on `/oidc/me` and in Console user detail.

## Data Flow

```
End user (experience app, sign-up in progress)
  │
  ├─(1) GET /api/experience/profile  ─► server returns missing fields incl. "avatar"
  │
  ├─(2) Select file → crop modal (react-easy-crop) → Blob
  │
  ├─(3) POST /api/experience/user-assets  (multipart, session-anchored)
  │       │
  │       ├─ guard: isDevFeaturesEnabled
  │       ├─ guard: storageProviderConfig configured
  │       ├─ validate MIME + size
  │       └─ storage helper.upload(file) → { url }
  │
  ├─(4) Form value = { ..., avatar: url }
  │
  └─(5) PATCH /api/experience/profile  body: { type: 'extraProfile', values }
          │
          ├─ avatar branch → users.avatar = url
          └─ other keys  → customData (existing path)

Admin console (builds the field config)
  │
  ├─ use-user-assets-service.isReady → enables/disables the "avatar" option
  └─ Create/edit field modal posts to the existing custom-profile-fields API
```

## Failure Modes

| Codepath | What goes wrong | User sees | Handling today | Test? |
|---|---|---|---|---|
| `POST /api/experience/user-assets` — storage unconfigured | Tenant has avatar field enabled (somehow) without storage | 501 error toast in crop modal | **Will add** explicit 501 with `storage.not_configured`; Console should prevent reaching this state | Integration test |
| `POST /api/experience/user-assets` — oversized file | User selects a huge image | Inline error in field | **Will add** client-side gate; server rejects as backup | Frontend + integration |
| Crop → Blob — browser OOM on very large source | Huge image causes canvas failure | No upload, silent failure | **Critical gap** if unhandled → **Will add** try/catch around canvas export, show inline error | Frontend test |
| `storageProvider.upload` — provider outage / auth failure | S3 500s | Toast with retry | Surface `storage.upload_failed` | Integration (mock provider) |
| `fulfillProfile` with `avatar = ''` | User removed avatar | Persist empty string (clear) | `nameAndAvatarGuard` allows `''` | Unit on persistence |
| Race: user navigates away mid-upload | Fetch left hanging | — | `AbortController` on unmount | Frontend test |
| Schema union widened but client sent old `Url` payload against key `avatar` | Backwards compat risk | — | Union keeps both guards; `Url` path with `name: 'avatar'` remains legal for non-flag tenants. When flag flips on, Console stops emitting that config. No migration needed because dev-flag-gated shape never reached prod. | N/A |

## Migration / Rollback

- **Backward compat:** The union is widened additively; no existing rows change shape. Disabling the flag hides all UI surfaces and rejects the new route. Rollback = revert the PR.
- **Data migration:** None.
- **Rollback plan:** Revert commits; any test tenant that stored an `Avatar` field in config would need its field config cleared, but since this is behind the dev flag, only dev/sandbox tenants are affected.

## PR Breakdown

Single PR. All surfaces share one flag; splitting would produce intermediate states that are neither useful nor reviewable on their own.

If scope creeps during execution, a valid secondary split is:

1. PR 1: schemas + core endpoint + persistence.
2. PR 2: console + experience UI.

Default to single PR; escalate to split only if review size demands it.

## Checklist Before Execution

- [x] Step 0 scope challenge completed (reused schemas' discriminated union, Console's built-in keys list, existing storage helpers, existing collect-profile form renderer — only one new endpoint and one new dependency).
- [x] All edge cases documented (crop OOM, oversized file, storage outage, empty string, race on unmount, schema backward compat).
- [x] Failure modes analysed with user-visible behavior.
- [x] Error paths specified (dev-flag 404, storage 501, MIME/size 400, upload failure 5xx surfaced as toast).
- [x] Test scenarios listed at unit / integration / frontend / manual levels.
- [x] Experience Library applied: dev-feature gating, no changeset until flag removal, OpenAPI update for new endpoint.
- [ ] Open question to resolve during execution: confirm the experience router already carries rate-limiting that covers the new upload route; if not, add it.
- [ ] Open question to resolve during execution: confirm client-side abort semantics against `ky` (the HTTP client used in `packages/experience`).
