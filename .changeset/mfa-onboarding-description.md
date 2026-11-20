---
"@logto/phrases-experience": patch
---

stop listing specific methods in the "Turn on 2-step verification" description

The description listed passkey, authenticator app, SMS verification code, and backup codes regardless of which factors the tenant enabled, so it left out email and named backup codes even when they were off. It now asks the user to choose one or more methods without naming them; the factor list on the next step shows the methods the tenant enabled.
