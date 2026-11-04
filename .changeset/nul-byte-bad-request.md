---
"@logto/core": patch
---

return 400 instead of 500 when a Management API request contains a NUL character

A NUL character (`\u0000` in a JSON body or `%00` in a query or path) in a text value, for example `GET /api/users?search=%00` or `POST /api/roles` with a `name` containing `\u0000`, made PostgreSQL reject the query with `invalid byte sequence for encoding "UTF8": 0x00` and the API responded with `500 Internal server error`. It now responds with `400 request.invalid_input`.
