---
"@logto/experience": patch
---

return users to the Logto sign-in page after blocked social or SSO registration

When a social or SSO authentication callback falls back to registration and the email is rejected by email access rules, acknowledging the error now returns the user to the Logto sign-in page instead of navigating back to the external identity provider
