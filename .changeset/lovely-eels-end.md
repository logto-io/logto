---
"@logto/core": patch
---

fix email/phone template selection during sign up

Previously, the send code API (Experience API) always switched to the `TemplateType.BindMfa` email template as soon as an interaction already had an identified user. During multi-step sign-up flows (for example, username + email), the interaction can already identify the user before the email step finishes, so legitimate sign-up verifications were mistakenly treated as MFA binding and used the wrong template.

The fix checks if the email/phone identifier is part of the sign-up identifiers. If it is, then we are still in the sign-up flow and should use the appropriate sign-up email/phone template. Only when the email/phone is not part of the sign-up identifiers (meaning the sign-up flow is complete) and the interaction has an identified user, do we switch to the `BindMfa` template.
