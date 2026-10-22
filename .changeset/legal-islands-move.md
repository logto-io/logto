---
"@logto/core": minor
---

support search users by exact custom data in the Management API

`GET /api/users` now accepts a repeatable `customData` query parameter that matches users whose custom data contains the given JSON object, for example `customData={"customId":114514}`. Repeated values are combined with OR, and the condition is combined with other user filters using AND.
