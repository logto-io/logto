---
"@logto/core": patch
---

count every attempt at a verification code toward its retry limit, and accept a correct code from at most one request

An attempt after the limit is reached gets `verification_code.exceed_max_try`, and any other request that presents a code already used gets `verification_code.not_found`.
