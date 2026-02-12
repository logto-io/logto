---
"@logto/console": minor
"@logto/core": minor
"@logto/schemas": minor
"@logto/phrases": minor
---

add application context to JWT customizer

The application context is now available in the JWT customizer script for both access token and client credentials token types. This allows you to access application details (e.g., name, description, custom data) when customizing JWT claims.
