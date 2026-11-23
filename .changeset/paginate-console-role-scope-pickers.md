---
"@logto/console": patch
---

paginate and search API resource permission pickers on the server

Role, organization role, and application API resource permission assignment modals now use server-side pagination and debounced server-side search against `GET /api/resources`, preventing timeouts on tenants with a large number of API resources (such as machine-to-machine role permission pickers on tenants with many Management API resources).
