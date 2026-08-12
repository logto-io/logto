---
"@logto/core": patch
---

Fix a cache race that could serve stale configuration (e.g. sign-in experience, connectors) for up to 30 minutes after an update. A read that started before the update could write its outdated result back into the cache after the update's invalidation; cache invalidation is now awaited and outdated write-backs are discarded.
