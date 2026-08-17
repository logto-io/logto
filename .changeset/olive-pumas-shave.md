---
'@logto/core': patch
---

require token exchange subject tokens to come from a first-party application

Token exchange does not inherit the subject token's audience or scopes — the issued token carries the receiver's authorization for the user, which for a first-party receiver means every scope the user's roles grant. The subject token's issuing client was previously discarded, so an access token held by a third-party application could be presented to any token-exchange-enabled client and converted into the user's full first-party authorization, turning a narrowly consented credential into a much broader one.

The subject token must now have been issued to a first-party application, on both the opaque and the JWT path. Third-party applications are already barred from enabling token exchange as the receiver; this closes the same boundary on the subject side. A subject token whose issuing client no longer exists is rejected as well.

**Breaking**: if you deliberately exchange access tokens issued to third-party applications, those requests now fail with `invalid_grant`. Use a first-party application to obtain the subject token instead.
