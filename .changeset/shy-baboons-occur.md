---
"@logto/experience": minor
"@logto/schemas": minor
"@logto/core": minor
"@logto/integration-tests": patch
---

support experience data server-side rendering

Logto now injects the sign-in experience settings and phrases into the `index.html` file for better first-screen performance. The experience app will still fetch the settings and phrases from the server if:

- The server didn't inject the settings and phrases.
- The parameters in the URL are different from server-rendered data.
