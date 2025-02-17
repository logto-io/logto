---
"@logto/core": patch
---

fixes an incorrect condition check in the verification code flow where `isNewIdentifier` was using inverted logic for email and phone comparisons.

### Changes

- Corrected `isNewIdentifier` boolean logic to use `identifier.value !== user.primaryEmail` for email checks
- Fixed phone number comparison to properly use `identifier.value !== user.primaryPhone`

### Impact

This fixes a regression where:

- Verification codes for existing emails/phones were incorrectly using the`BindNewIdentifier` template
- New identifiers were mistakenly getting the `UserPermissionValidation` template
- Affected both email and phone verification flows
