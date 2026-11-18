---
"@logto/console": patch
---

show save errors for uploaded files in SAML enterprise SSO connector settings

When saving a SAML enterprise SSO connector fails because the uploaded IdP metadata XML is rejected, for example metadata without an HTTP-Redirect sign-in endpoint or service provider metadata uploaded by mistake, the error now appears below the uploaded file. Previously nothing was shown and the save silently failed.
