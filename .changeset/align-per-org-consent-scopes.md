---
"@logto/core": patch
---

align per-organization consent scopes with organization roles for third-party and CIMD clients

When consenting third-party applications and CIMD clients to organizations, the per-organization permission list and saved grant now include only API scopes granted by that organization's roles rather than global user roles. Authorization-stage scope resolution also evaluates personal and organization permissions per context, preventing consent loops when a scope is held only via a global role and configured only as an organization resource scope.
