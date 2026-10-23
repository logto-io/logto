---
"@logto/core": patch
---

keep repeated query parameters in pagination `Link` headers

Management API list endpoints, such as `GET /api/applications?types=SPA&types=Traditional&page=1`, now return `first`, `prev`, `next` and `last` links that keep every value of a repeated query parameter, instead of joining them into a single comma-separated value that changes the results of the linked page.
