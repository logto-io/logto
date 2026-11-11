---
"@logto/core": minor
"@logto/phrases": minor
---

show a friendly error page when an OIDC error can't be sent back to the app

When a browser hits an OIDC error that can't safely be redirected back to the app, such as a `redirect_uri` that isn't registered or an unknown `client_id`, it now sees a localized page in the style of the sign-in experience instead of raw JSON. Developers can expand "Error details" to see the error response. API clients keep receiving the same JSON.
