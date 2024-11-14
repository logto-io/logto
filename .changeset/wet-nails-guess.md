---
"@logto/console": minor
"@logto/core": minor
"@logto/phrases": minor
"@logto/schemas": minor
---

add unknown session redirect url in the sign-in experience settings

In certain cases, Logto may be unable to properly identify a user’s authentication session when they land on the sign-in page. This can happen if the session has expired, if the user bookmarks the sign-in URL for future access, or if they directly share the sign-in link. By default, an "unknown session" 404 error is displayed.

To improve user experience, we have added a new `unknownSessionRedirectUrl` field in the sign-in experience settings.You can configure this field to redirect users to a custom URL when an unknown session is detected. This will help users to easily navigate to your client application or website and reinitiate the authentication process automatically.
