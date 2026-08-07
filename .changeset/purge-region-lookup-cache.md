---
'@logto/schemas': patch
'@logto/core': patch
---

purge the edge region-lookup cache on custom domain changes

In multi-region Cloud deployments, the edge worker caches hostname → region bindings, but adding or deleting a custom domain only cleared the region-local Redis cache. When a custom domain was deleted from one tenant and re-added to a tenant in a different region, the edge kept proxying to the old region until the cache entry expired (up to 8 hours), and requests failed with 404.

A new optional `cloudflareRegionLookupKvProvider` system configuration (account ID, KV namespace ID, key prefix, and an API token with KV Storage Edit permission) lets core delete the corresponding Cloudflare KV entry whenever a custom domain is added, deleted, or cleaned up, so hostname re-bindings take effect at the edge immediately. The purge is best-effort and skipped when the configuration is absent, so OSS and single-region deployments are unaffected.
