---
"@logto/experience": minor
---

Implement the new single sign-on (SSO) interaction flow

- `/single-sign-on/email` - The SSO email form page for user to enter their email address.
- `/single-sign-on/connectors` - The SSO connectors page for user to select the enabled SSO connector they want to use.
- Implement the email identifier guard on all the sign-in and registration identifier forms. If the email address is enabled with SSO, redirect user to the SSO flow.
