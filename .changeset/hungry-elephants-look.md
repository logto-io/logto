---
"@logto/core": patch
---

move password encyption to separate worker thread

This update refactors the password encryption process by moving it to a separate Node.js worker thread. The Argon2i encryption method, known for its resource-intensive and time-consuming nature, is now handled in a dedicated worker. This change aims to prevent the encryption process from blocking other requests, thereby improving the overall performance and responsiveness of the application.
