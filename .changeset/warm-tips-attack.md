---
"@logto/core": patch
---

refactored swagger json api

- reuse parameter definitions, which reduces the size of the swagger response.
- tags are now in sentence case.
- path parameters now follow the swagger convention, using `{foo}` instead of `:foo`.
