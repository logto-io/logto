---
"@logto/core": patch
---

count email and phone MFA factors when issuing organization tokens for organizations that require MFA

Users whose only MFA factor is the email verification code or SMS verification code enabled in the sign-in experience were always denied organization tokens for organizations that require MFA, even after completing MFA at sign-in. Organization token issuance now uses the same MFA factors as sign-in, and the Console's tenant MFA status and list of members without MFA follow the same rule.
