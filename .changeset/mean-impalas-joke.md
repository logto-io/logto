---
"@logto/console": patch
"@logto/core": patch
---

add body-based personal access token APIs

introduce PATCH/POST endpoints that accept token names in the request body to support special characters while keeping path-based routes for compatibility:
- PATCH /api/users/{userId}/personal-access-tokens
- POST /api/users/{userId}/personal-access-tokens/delete
