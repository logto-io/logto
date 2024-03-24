---
"@logto/schemas": minor
---

add oidc params variables and types

- Add `ExtraParamsKey` enum for all possible OIDC extra parameters that Logto supports.
- Add `FirstScreen` enum for the `first_screen` parameter.
- Add `extraParamsObjectGuard` guard and `ExtraParamsObject` type for shaping the extra parameters object in the OIDC authentication request.
