---
"@logto/core": patch
---

migrate `/dashboard` API data source

Updates:
- the responded data from `/dashboard/users/new` API is now based on UTC time
- the responded data from `/dashboard/users/active` API is now based on UTC time
- the query parameter `date` for `/dashboard/users/active` API is now based on UTC time