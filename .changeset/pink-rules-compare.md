---
'@logto/integration-tests': patch
'@logto/core': patch
---

fix potential WebAuthn registration errors by specifying the displayName

This is an optional field, but it's actually required by some browsers. For example, when using Chrome on Windows 11 with the "Use other devices" option (scanning QR code), an empty displayName will cause the registration to fail.
