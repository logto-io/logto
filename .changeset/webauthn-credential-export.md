---
"@logto/core": minor
---

export WebAuthn credentials from the user MFA verifications Management API

`GET /api/users/{userId}/mfa-verifications` now returns the stored credential for each WebAuthn verification: `credentialId`, `publicKey` (base64url COSE), `counter` (`signCount`), `transports`, and `rpId`. Tenants can use them to migrate passkeys on the same domain. The user binding is the path `userId`, whose UTF-8 bytes Logto registers as the WebAuthn `userHandle`. The fields are also returned under read-only access, since a WebAuthn public key and credential ID cannot be used to sign in. The Account API response is unchanged.
