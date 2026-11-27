---
"@logto/core": patch
---

keep reconnecting to Redis after an outage instead of running without the cache until restart

Logto stopped retrying after about 10 seconds without Redis, and a Redis Cluster connection never reconnected after a node connection dropped. Either way, Logto ran without the cache, and cache invalidations failed until the process restarted. Logto now retries with a delay capped at 5 seconds for as long as Redis is unavailable. Startup waits at most 5 seconds for Redis, then continues without the cache and connects once Redis is reachable.
