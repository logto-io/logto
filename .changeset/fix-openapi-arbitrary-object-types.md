---
"@logto/core": patch
---

declare `additionalProperties: true` on arbitrary JSON object schemas in the OpenAPI document. Generated TypeScript clients (e.g. `@logto/api`) now type fields such as `customData` as `{ [key: string]: unknown }` instead of `Record<string, never>`, which previously forbade every property at compile time
