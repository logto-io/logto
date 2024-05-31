---
"@logto/core-kit": minor
"@logto/core": minor
---

define new `sso_identities` user claim

- Define a new `sso_identities` user claim that will be used to store the user's SSO identities. The claim will be an array of objects with the following properties:
  - details: detailed user info returned from the SSO provider.
  - issuer: the issuer of the SSO provider.
  - identityId: the user id of the user in the SSO provider.
- The new claims will share the same scope as the social `identities` claim.
- When the user `identities` scope is requested, the new `sso_identities` claim will be returned along with the `identities` claim in the userinfo response.
