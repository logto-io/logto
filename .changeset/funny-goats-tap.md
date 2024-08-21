---
"@logto/console": minor
"@logto/core": minor
"@logto/phrases": minor
"@logto/schemas": minor
---

Add personal access token (PAT)

Personal access tokens (PATs) provide a secure way for users to grant access tokens without using their credentials and interactive sign-in.

You can create a PAT by going to the user's detail page in Console or using the Management API `POST /users/:userId/personal-access-tokens`.

To use a PAT, call the token exchange endpoint `POST /oidc/token` with the following parameters:

1. `grant_type`: REQUIRED. The value of this parameter must be `urn:ietf:params:oauth:grant-type:token-exchange` indicates that a token exchange is being performed.
2. `resource`: OPTIONAL. The resource indicator, the same as other token requests.
3. `scope`: OPTIONAL. The requested scopes, the same as other token requests.
4. `subject_token`: REQUIRED. The user's PAT.
5. `subject_token_type`: REQUIRED. The type of the security token provided in the `subject_token` parameter. The value of this parameter must be `urn:logto:token-type:personal_access_token`.
6. `client_id`: REQUIRED. The client identifier of the client application that is making the request, the returned access token will contain this client_id claim.

And the response will be a JSON object with the following properties:

1. `access_token`: REQUIRED. The access token of the user, which is the same as other token requests like `authorization_code` or `refresh_token`.
2. `issued_token_type`: REQUIRED. The type of the issued token. The value of this parameter must be `urn:ietf:params:oauth:token-type:access_token`.
3. `token_type`: REQUIRED. The type of the token. The value of this parameter must be `Bearer`.
4. `expires_in`: REQUIRED. The lifetime in seconds of the access token.
5. `scope`: OPTIONAL. The scopes of the access token.
