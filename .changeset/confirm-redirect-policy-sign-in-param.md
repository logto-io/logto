---
"@logto/schemas": minor
"@logto/core": minor
"@logto/experience": minor
"@logto/phrases-experience": minor
---

add the `confirm_redirect_policy` sign-in parameter to show a "Continue" page before returning to the app

On iOS, `ASWebAuthenticationSession` closes as soon as it sees the app callback URL, so the system "Save Password" prompt is dismissed right after the user signs in with a password. Pass `confirm_redirect_policy=password` in the authorization request to show a "Return to the app" page after the user entered a password in the sign-in experience (password sign-in, password registration, setting a password, or a step-up password verification). The page returns to the app only when the user selects "Continue".

Omit the parameter to keep redirecting back to the app right away. Third-party applications ignore it, because they usually show a consent page that already holds the session open.
