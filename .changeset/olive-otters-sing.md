---
"@logto/api": minor
---

improve API SDK client reliability and ergonomics

- reject token request redirects, support custom abort signals and a configurable 10-second timeout, and share one token fetch across concurrent requests
- invalidate a rejected cached token once without continuously fetching tokens for permanent `401` responses
- normalize trailing slashes in custom base URLs
- support lowercase API client methods such as `.get()` and `.post()` while keeping the uppercase methods available
- apply a configurable 10-second timeout to Management API network requests while preserving per-request cancellation
- emit scope mismatch warnings once per distinct scope and preserve token request failure causes
