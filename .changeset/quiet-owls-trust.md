---
"@logto/core": patch
---

count email and phone MFA factors when issuing organization tokens for organizations that require MFA

Users whose only MFA factor is the email verification code or SMS verification code enabled in the sign-in experience were always denied organization tokens for organizations that require MFA, even after completing MFA at sign-in. Organization token issuance now uses the same MFA factors as sign-in, and the Console's tenant MFA status and list of members without MFA follow the same rule.

This also means MFA factors that are not enabled in the sign-in experience, and backup codes that have all been used, no longer count as configured MFA. Users in an organization that requires MFA whose only MFA is such a factor (for example, a TOTP added through the Management API while TOTP is not enabled, or a factor that was later disabled) are denied organization tokens until they set up an enabled MFA factor. With the organization MFA policy set to mandatory in the sign-in experience, they are asked to do so at their next sign-in.
