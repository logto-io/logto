---
"@logto/core": patch
---

link enterprise SSO sign-ins to existing accounts by email only on the connector's email domains

Upgrade note: an enterprise SSO sign-in is linked automatically to an existing account with the same email only when the email's domain is listed in the connector's "Enterprise email domains", so list every email domain the connector serves.
