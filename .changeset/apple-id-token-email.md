---
"@logto/connector-apple": patch
---

use only the verified email from the Apple ID token

The Apple connector now takes the user's email only from the Apple ID token, and recognizes `email_verified` whether Apple sends it as `true` or `"true"`. When Apple marks the email as unverified, no email is returned. The name still comes from the user details Apple sends on the first authorization.
