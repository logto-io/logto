---
"@logto/console": minor
"@logto/core": minor
"@logto/integration-tests": minor
"@logto/schemas": minor
---

Provide new features for webhooks

## Features

- Manage webhooks via the Admin Console
- Securing webhooks by validating signature
- Allow to enable/disable a webhook
- Track recent execution status of a webhook
- Support multi-events for a webhook
- Add a unique message id for each webhook request
  
## Updates

- schemas: add `name`, `events`, `signingKey`, and `enabled` fields to the `hook` schema
- core: change the `user-agent` value from `Logto (https://logto.io)` to `Logto (https://logto.io/)` in the webhook request headers
- core: deprecate `event` field in all hook-related APIs, use `events` instead
- core: deprecate `retries` field in the `HookConfig` for all hook-related APIs, now it will fallback to `3` if not specified and will be removed in the future
- core: add a unique message id for each webhook request
- core: add new APIs for webhook management
  - `GET /api/hooks/:id/recent-logs` to retrieve recent execution logs(24h) of a webhook
  - `POST /api/hooks/:id/test` to test a webhook
  - `PATCH /api/hooks/:id/signing-key` to regenerate the signing key of a webhook
- core: support query webhook execution stats(24h) via `GET /api/hooks/:id` and `GET /api/hooks/:id` by specifying `includeExecutionStats` query parameter
- console: support webhook management
