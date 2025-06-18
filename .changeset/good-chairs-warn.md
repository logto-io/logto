---
"@logto/core": patch
---

fix SAML application callback API `RelayState` parameter handling

Previously, the `RelayState` parameter was not properly passed through in SAML authentication responses. Now when a SAML authentication response contains `RelayState`, it will be correctly included in the auto-submit form.
