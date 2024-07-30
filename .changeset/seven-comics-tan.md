---
"@logto/core": minor
---

implement token exchange for user impersonation

Added support for user impersonation via token exchange:

1. New endpoint: `POST /subject-tokens` (Management API)
   - Request body: `{ "userId": "<user-id>" }`
   - Returns a subject token

2. Enhanced `POST /oidc/token` endpoint (OIDC API)
   - Supports new grant type: `urn:ietf:params:oauth:grant-type:token-exchange`
   - Request body:
     ```json
     {
       "grant_type": "urn:ietf:params:oauth:grant-type:token-exchange",
       "subject_token": "<subject-token>",
       "subject_token_type": "urn:ietf:params:oauth:token-type:access_token",
       "client_id": "<client-id>"
     }
     ```
   - Returns an impersonated access token

Refer to documentation for usage examples and the [Token Exchange RFC](https://tools.ietf.org/html/rfc8693) for more details.
