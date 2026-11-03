---
"@logto/console": minor
"@logto/core": minor
"@logto/phrases": minor
"@logto/schemas": minor
---

add a Cross-Origin-Opener-Policy setting for Bring your UI sign-in pages

Tenants with Bring your UI can choose `same-origin-allow-popups` or `same-origin` under Sign-in experience > Branding > Bring your UI, or set `crossOriginOpenerPolicy` with the sign-in experience Management API. The header is sent on the hosted sign-in pages while custom UI assets are served. The default, `unsafe-none`, sends no header, so apps that open the sign-in page in a popup keep working.
