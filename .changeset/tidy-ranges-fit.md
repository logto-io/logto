---
"@logto/tunnel": patch
---

clamp `Range` requests for static files in the experience path to the file size

When serving files from `--experience-path`, a `Range` whose end is past the end of the file is now clamped to the file size, and a `Range` that cannot be satisfied (one that starts at or after the end of the file, or starts after its own end) returns 416.
