---
"@logto/schemas": minor
"@logto/core": minor
---

add a dedicated sign-up profile fields config (backend only, dev feature)

introduce a two-layer model for custom profile fields: the `custom_profile_fields` table remains the master catalog, and a new `sign_up_profile_fields` column on `sign_in_experiences` stores the ordered subset that should be collected during sign-up. this prepares the catalog to be reused on other surfaces (e.g. the account center) without coupling them to sign-up ordering.

- schemas: new nullable `sign_up_profile_fields` jsonb column with a `SignUpProfileFields` type (`Array<{ name: string }>`).
- core: `PATCH /api/sign-in-exp` accepts `signUpProfileFields` when `isDevFeaturesEnabled` is on, validating that each referenced name exists in the catalog and is unique. the field is silently stripped when the flag is off.
- core: the experience API and the sign-up profile validator filter and order the catalog by `signUpProfileFields` only when dev features are enabled and the column is set. otherwise they fall back to the existing `sie_order`-based behavior, so production is unaffected.
