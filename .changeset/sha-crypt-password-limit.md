---
"@logto/core": patch
---

limit the length of passwords verified against `sha256-crypt` and `sha512-crypt` legacy password digests

A password longer than 4,096 bytes (UTF-8) never matches these digests, so verifying it fails as with a wrong password.
