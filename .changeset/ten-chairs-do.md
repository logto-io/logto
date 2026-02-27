---
"@logto/integration-tests": patch
"@logto/core": patch
---

fix the issue that the "Tell us about yourself" section does not appear during signup when only optional custom profile fields are configured

Previously, the `hasMissingExtraProfileFields` method only checked for required custom profile fields, causing the "Tell us about yourself" section to not appear during signup when only optional fields were configured.

Now, the method also checks for optional fields and whether the user has submitted the extra profile form, ensuring that the section is always displayed as expected.
