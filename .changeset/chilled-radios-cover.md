---
"@logto/cli": patch
---

fix fetch official connector list CLI command error

Due to changes in the npm registry API (`https://registry.npmjs.org/-/v1/search`) that our CLI add official connector depends on, the new API behavior returns irrelevant search results.

We need to manually filter out these irrelevant results to avoid potential infinite loops, where each loop triggers an API call, eventually hitting a rate limit and resulting in a status code 429.
