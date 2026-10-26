---
"@logto/core": patch
---

run the official Docker image on Node.js 22.23.4

The image now pins Node.js 22.23.4, which fixes CVE-2026-111497 in the bundled Brotli decoder. If you run Logto on your own Node.js runtime, upgrade to Node.js 22.23.4 or later.
