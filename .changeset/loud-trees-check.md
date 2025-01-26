---
"@logto/core-kit": patch
---

refactor user claims type and introduce `userClaimsList`

- Introduce a new exported variable `userClaimsList` containing all possible user claims.
- Utilize `userClaimsList` to derive the `UserClaim` type, ensuring consistency and maintainability.
