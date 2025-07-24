---
"@logto/core": minor
---

add totp and backup code via account api

Users can now add TOTP and backup code via Account API.

The endpoints are:

- `POST /api/my-account/mfa-verifications/totp-secret/generate`: Generate a TOTP secret.
- `POST /api/my-account/mfa-verifications/backup-codes/generate`: Generate backup codes.
- `POST /api/my-account/mfa-verifications`: Add a TOTP or backup code using the generated secret or codes.
- `GET /api/my-account/mfa-verifications/backup-codes`: Retrieve backup codes.
