---
"@logto/core": minor
"@logto/console": minor
"@logto/schemas": minor
"@logto/phrases": minor
---

add custom domain verification file support

Admins can configure small text or JSON verification files for active custom domains. Files are limited to root-level filenames or paths under `/.well-known/`, with caps on count and content size. Exact GET and HEAD matches are served with safe content types while existing Logto routes take precedence.
