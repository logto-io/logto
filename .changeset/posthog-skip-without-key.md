---
"@logto/console": patch
---

skip initializing PostHog in the Console when no public key is configured

Self-hosted deployments that opt out of telemetry by omitting `POSTHOG_PUBLIC_KEY` now render the PostHog provider with a no-op client instead of an empty API key, avoiding spurious browser console warnings.
