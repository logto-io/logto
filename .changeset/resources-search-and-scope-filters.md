---
"@logto/core": minor
---

support server-side search and scope filtering on `GET /api/resources`

`GET /api/resources` now supports standard search query parameters (`search`, `search.<field>`, `mode`, `joint`, `isCaseSensitive`) matching resource ID, name, indicator, and scope name, as well as `hasScopes` (to return only resources with at least one scope) and `excludeRoleId` (to exclude scopes already assigned to a role when filtering or attaching scopes).
