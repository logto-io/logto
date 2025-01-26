---
"@logto/core-kit": patch
---

refactor user claims type and introduce `completeUserClaims`

- Introduce a new exported variable `completeUserClaims` containing all possible user claims.
- Utilize `completeUserClaims` to derive the `UserClaim` type, ensuring consistency and maintainability.
