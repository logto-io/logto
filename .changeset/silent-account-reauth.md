---
"@logto/account": patch
---

fix: silently re-authenticate Account Center on user info error instead of forcing the login screen

When `/api/my-account` returns an error (e.g. a stale access token after a user switch on the same browser), Account Center now redirects with `prompt=none` so the OIDC provider can re-authenticate via the existing session cookie. If no valid session is available the provider answers with `error=login_required` and Account Center falls back to the previous `prompt=login` behavior, preserving the stale-state cleanup invariant from #8313 / #8554 / #8590.
