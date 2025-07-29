---
"@logto/schemas": patch
---

fix: add tenant-aware foreign key constraint to organization_user_relations table

### Problem

Developers could mistakenly assign a `user_id` from other tenants to an organization, causing 500 errors on organization users API endpoints. The original `organization_user_relations` table only had a foreign key constraint on `users (id)`, allowing any existing user ID to be assigned regardless of tenant isolation.

### Root cause

Logto applies Row Level Security (RLS) on all tables to isolate tenant data access. When joining the `users` table with `organization_user_relations`, the actual user data becomes inaccessible to the current tenant due to RLS restrictions, causing user data to return `null` and triggering 500 server errors.

### Solution

Added a composite foreign key constraint `(tenant_id, user_id)` referencing `users (tenant_id, id)` to ensure the organization-user relation's tenant ID matches the user's tenant ID. This enforces proper tenant isolation at the database level.
