---
"@logto/core": patch
---

revoke built-in client grants when a session is revoked with the first-party target

Revoking a user session with `revokeGrantsTarget=firstParty`, through the Management API or the Account API, now also revokes the grants and tokens issued to Logto's built-in clients (Account Center, Live Preview and Device Flow Preview). Previously only applications registered in the tenant were treated as first-party, so refresh tokens issued to the built-in clients stayed valid after the session was revoked.
