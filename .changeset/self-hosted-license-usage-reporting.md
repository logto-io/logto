---
"@logto/core": minor
"@logto/schemas": minor
"@logto/console": minor
"@logto/phrases": minor
---

report self-hosted license usage and warn in Console when usage exceeds plan limits

Self-hosted deployments with an active license evaluate usage locally, warn in Console when limits are exceeded without blocking features, and include aggregated usage counts in license refreshes unless `SELF_HOSTED_LICENSE_USAGE_REPORTING_DISABLED=1` is set on every Core instance.
