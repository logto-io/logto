---
"@logto/core": patch
---

require a first-party application for Account API third-party token retrieval

The three Account API endpoints that return or refresh a stored social / enterprise SSO provider token now require a first-party application, matching the first-party only policy the other account routes already enforce:

- `GET /my-account/identities/:target/access-token`
- `GET /my-account/sso-identities/:connectorId/access-token`
- `PUT /my-account/identities/:target/access-token`

These routes were missed when the policy was applied to account mutations, and again when it was extended to account reads that need recent authentication. A stored provider token is a bearer credential for the upstream provider rather than a profile attribute, so it belongs inside that boundary: the `identities` scope tells an application it may read the user's identity details, and the end user consents to "Your social identities" — neither grants custody of a live provider credential.

Third-party applications now receive `403 auth.third_party_application_forbidden` from these three endpoints. First-party applications are unaffected, including Account Center and Console. If an integration retrieves stored provider tokens today, use a first-party application to obtain the access token.
