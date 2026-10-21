---
"@logto/core": minor
"@logto/experience": minor
---

return an `access_denied` OAuth error when a user cancels consent or a direct sign-in fails

Cancelling the built-in consent page now finishes the interaction with `access_denied` and sends the user back to the client application with the original `state` and `iss`, instead of redirecting to the client without the OAuth context. A failed direct sign-in returns to the client the same way instead of falling back to the hosted sign-in page.

Custom experiences can finish the current interaction with the same error through the new `POST /api/experience/abort` endpoint, optionally with a `reason` that becomes `error_description`. `GET /api/experience/interaction/direct-sign-in` returns the `direct_sign_in` value of the current authorization request, so a custom experience can tell a direct sign-in apart from a hosted one before the interaction is initialized.
