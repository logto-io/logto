---
"@logto/schemas": patch
---

refactor: set the default value of account center `enabled` to true.

As a result, the account API will be enabled by default, allowing users to access and manage their accounts. To control the visibility and accessibility of individual fields, use the `fields` property. By default, all fields are inaccessible; you can selectively enable them as needed.
