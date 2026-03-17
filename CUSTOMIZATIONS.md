# BDM Logto Customizations

This document describes all changes made to the upstream [Logto](https://github.com/logto-io/logto) codebase in this fork. It is intended to make rebasing, upgrading, and onboarding easier by clearly separating custom work from upstream code.

## Overview

The primary addition is a **self-service management dashboard** built into the Account Center SPA (`packages/account`). This allows end-users to view and edit their own profile, security settings, and MFA options from a single page, gated by the existing `AccountCenterFieldControl` settings configured in the admin console.

---

## Changes by Package

### `packages/account`

#### New pages

| Path | Description |
|------|-------------|
| `src/pages/Home/` | Management dashboard — the root route (`/`). Shows personal info (name, given name, family name, avatar, username, email, phone) and security fields (password, TOTP, passkeys, backup codes) as read-only rows with contextual action buttons. Respects `AccountCenterControlValue` (Off / ReadOnly / Edit) for each field. Includes an empty state when all fields are `Off`. |
| `src/pages/TotpManage/` | TOTP removal flow at `/authenticator-app/manage`. Requires a fresh verification, shows the current authenticator app status, and allows the user to remove it via a confirmation modal. |

#### Modified pages

| Path | Change |
|------|--------|
| `src/pages/Profile/index.tsx` | Extended to handle `profile.givenName` and `profile.familyName` in addition to the existing `name` and `avatar` fields. Submits two API calls when both are active: `PATCH /api/my-account` (name/avatar) and `PATCH /api/my-account/profile` (givenName/familyName). Visibility is controlled by `fields.profile` (`AccountCenterControlValue`). |
| `src/pages/TotpBinding/index.tsx` | Now redirects to `/authenticator-app/manage` via `useEffect` when TOTP is already configured, instead of showing an error state. |
| `src/pages/UpdateSuccess/index.tsx` | Conditionally shows a "Back to account" button (using React Router `navigate('/')`) when no external `redirectUrl` is present in session storage. External redirect flows (post-signin / onboarding) are unchanged. |

#### New files (within existing pages)

| Path | Description |
|------|-------------|
| `src/pages/Home/FieldRow.tsx` | Shared `FieldRow` display component and `editAction` helper used by `PersonalInfoSection` and `SecuritySection`. |
| `src/pages/Home/PersonalInfoSection.tsx` | Personal info section of the dashboard. Profile-route fields (name, given name, family name, avatar) render as a group with a **single** "Edit" button in the section header. Contact fields (username, email, phone) each have their own action button. Also exports `checkHasPersonalInfoFields`. |

#### Other modified files

| Path | Change |
|------|--------|
| `src/apis/account.ts` | Added `updateProfileFields(profile: UserProfile)` calling `PATCH /api/my-account/profile`. |
| `src/constants/routes.ts` | Added `authenticatorAppManageRoute = '/authenticator-app/manage'`. |
| `src/App.tsx` | Registered the `TotpManage` component at `authenticatorAppManageRoute`. |

#### Dashboard design decisions

- **Field visibility**: Each field row is gated by its corresponding `AccountCenterFieldControl` value. `Off` → hidden; `ReadOnly` → shown without action button; `Edit` → shown with "Edit"/"Add" button.
- **Profile card**: The top card prioritises `profile.givenName + profile.familyName` as the display name, falling back to `name`, then `username`. The initials avatar is derived from the same value.
- **Single edit button for profile fields**: Name, given name, family name, and avatar all navigate to the same `/profile` page, so they share one "Edit" button in the section header rather than having per-row buttons.
- **MFA status**: TOTP active/inactive state and passkey count are fetched on mount via `GET /api/my-account/mfa-verifications` (no verification record required).
- **Back to account CTA**: MFA success/failure pages detect whether the user arrived from the dashboard (no `redirectUrl` in session storage) and show a "Back to account" button instead of leaving the user stranded.

---

### `packages/phrases-experience`

New i18n keys added to `src/locales/*/account-center.ts` in all 18 supported locales (English is the authoritative source; other locales carry English placeholders until translated):

**`home` section**

| Key | Usage |
|-----|-------|
| `no_fields_available` | Empty state shown when all `AccountCenterFieldControl` values are `Off`. |
| `totp_active` | Status label shown when a TOTP authenticator app is configured. |
| `passkeys_count` / `passkeys_count_plural` | Status label showing number of registered passkeys (with `{{count}}` interpolation). |
| `return_to_account` | "Back to account" button label on MFA success pages. |
| `field_given_name` | Row label for given name field. |
| `field_family_name` | Row label for family name field. |

**`profile` section**

| Key | Usage |
|-----|-------|
| `given_name_label` | Input label on the profile edit page. |
| `family_name_label` | Input label on the profile edit page. |

**`mfa` section**

| Key | Usage |
|-----|-------|
| `totp_manage_title` | Page title for the TOTP management/removal page. |
| `totp_manage_description` | Descriptive text on the TOTP management page. |
| `totp_remove` | "Remove" button label. |
| `totp_removed` | Toast message shown after successful TOTP removal. |
| `totp_remove_confirm_description` | Confirmation modal body text. |

---

## Upstream Compatibility Notes

- No database schema changes were made (all features use existing Logto API endpoints and `AccountCenterFieldControl` fields).
- The `fields.profile` control value (`AccountCenterControlValue`) was already present in upstream Logto but unused in the account center. We now use it to gate `givenName`/`familyName` display and editing.
- `PATCH /api/my-account/profile` is an existing upstream endpoint; no backend changes were required.
- All ESLint rules (complexity, max-lines, import order, etc.) are satisfied — no rule suppressions were added.
