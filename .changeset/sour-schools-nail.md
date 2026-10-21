---
'@logto/core': minor
---

add `sha256-crypt` and `sha512-crypt` legacy password hash support

Users can now be imported with SHA-crypt hashes (`$5$` and `$6$`, as used by Linux, passlib, PHP, and others) by setting the password algorithm to `Legacy` and passing the complete stored crypt string in the password digest.
