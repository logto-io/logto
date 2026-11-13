---
"@logto/core": minor
---

export WebAuthn credentials from the user MFA verifications Management API

`GET /api/users/{userId}/mfa-verifications` now accepts an `includeWebAuthnCredentials` query parameter. When it is provided with a truthy value (`true`, `1`, `yes`), each WebAuthn verification includes its stored credential: `credentialId`, `publicKey` (base64url COSE), `counter` (`signCount`), `transports`, and `rpId`. These fields are omitted by default, so existing callers get the same response. Tenants can use them to migrate passkeys on the same domain. The user binding is the path `userId`, whose UTF-8 bytes Logto registers as the WebAuthn `userHandle`. The parameter is also honored under read-only access, since a WebAuthn public key and credential ID cannot be used to sign in. The Account API response is unchanged.
