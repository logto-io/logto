---
"@logto/core": patch
---

accept `scope` values with extra spaces in OAuth requests

Some clients, such as OpenAI Codex, refresh tokens with a `scope` value that has a leading space (for example, `" offline_access"`). Logto rejected these requests with `invalid_scope`, so users had to sign in again each time the access token expired. Logto now ignores the empty scope values that leading, trailing, or repeated spaces produce. A `scope` made only of spaces counts as omitted, so a refresh token request keeps the refresh token's original scope.
