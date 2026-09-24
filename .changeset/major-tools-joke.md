---
"@logto/core": minor
"@logto/schemas": minor
"@logto/console": minor
"@logto/phrases": minor
---

add a client compatibility setting so dynamic app clients such as ChatGPT and Codex can receive refresh tokens

These clients request `offline_access` without `prompt=consent`, so they don't receive a refresh token and users have to sign in again whenever the access token expires. Turn on "Add consent prompt for offline access" under Client compatibility in the dynamic app settings, and Logto adds the consent prompt to these requests. The setting is experimental and off by default, and audit logs show the added `consent` in `prompt`.
