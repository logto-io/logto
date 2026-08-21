---
'@logto/core': minor
'@logto/experience': minor
---

return direct sign-in errors to the client application instead of the hosted sign-in page

When a sign-in initiated with the `direct_sign_in` authentication parameter failed (connector error, invalid session, denied at the identity provider, etc.), the hosted experience fell back to the universal sign-in page, exposing sign-in methods the client application never offered. The interaction is now finished with a standard OAuth `access_denied` error and the user agent is redirected back to the client's `redirect_uri`, so the application that owns the sign-in UI handles the failure itself. A new `POST /api/experience/abort` endpoint backs this behavior. Sign-ins that entered through the hosted pages keep the existing fallback.
