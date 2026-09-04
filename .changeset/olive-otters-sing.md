---
'@logto/api': minor
---

improve API SDK client reliability and ergonomics

Token requests now reject redirects and time out after 10 seconds by default, with a configurable timeout that can be disabled using a non-positive value. Concurrent requests share one token fetch, and a 401 response invalidates the matching cached token so the next request fetches a fresh one. Repeated 401 responses do not cause continuous token fetching.

Custom base URLs can include trailing slashes without producing double slashes in token requests.

API clients now expose lowercase HTTP methods such as `.get()` and `.post()`, while keeping the existing uppercase methods available.

Scope mismatch warnings are emitted once per distinct mismatched scope.

Token request failures consistently use `ClientCredentialsError` and preserve the original error as the cause.

Management API requests now time out after 10 seconds by default, with a configurable client-wide timeout that preserves per-request cancellation.
