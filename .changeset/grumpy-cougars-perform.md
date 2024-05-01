---
"@logto/core": patch
---

implement request ID for API requests

- All requests will now include a request ID in the headers (`Logto-Core-Request-Id`)
- Terminal logs will now include the request ID as the prefix
