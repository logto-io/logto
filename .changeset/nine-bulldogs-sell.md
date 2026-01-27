---
"@logto/core": patch
---

remove default pagination from `GET /organizations/:id/jit/email-domains`

This refactor fixes an issue in the Logto Console.

Previously, default pagination (page size = 20) was implicitly enabled on the
`GET /organizations/:id/jit/email-domains` endpoint. However, in the Logto Console’s Organization details page, JIT email domains are displayed in a single multi-input field, which does not support pagination. As a result, only the first 20 records were returned and displayed, leading to confusing behavior and unexpected bugs.

Since the number of JIT email domains is currently expected to be relatively small, this change removes the default pagination behavior from the API. Clients may still explicitly enable pagination by providing pagination headers. If no pagination headers are provided, the API will return the full list of JIT email domain records.
