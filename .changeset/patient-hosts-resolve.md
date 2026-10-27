---
"@logto/core": patch
---

retry the database connection at startup when the host name cannot be resolved

The startup retry introduced for timed out and refused connections treated a failed DNS resolution of the database host (`getaddrinfo ENOTFOUND`, `EAI_AGAIN`) as fatal, so the process exited at once. On a container platform the resolver is often not ready when the pod starts, and a transient outage of the resolver produced a crash loop until it recovered. These two codes are now retried like the other transient connection errors.
