# @logto/api

## 1.36.0

### Minor Changes

- 61e5e818f1: add `createApiClient` function for custom token authentication

  This new function allows you to create a type-safe API client with your own token retrieval logic, useful for scenarios like custom authentication flows.

### Patch Changes

- 1fc65a2536: return role assignment results in user role APIs

  - POST `/users/:userId/roles` now returns `{ roleIds: string[]; addedRoleIds: string[] }` where `roleIds` echoes the requested IDs, and `addedRoleIds` includes only the IDs that were newly created (existing assignments are omitted)
  - PUT `/users/:userId/roles` now returns `{ roleIds: string[] }` to confirm the final assigned roles

## 1.35.0

## 1.34.0

## 1.33.0

## 1.32.0

## 1.31.0

## 1.30.1

## 1.30.0

### Minor Changes

- 89fcf8181: init Logto API SDK

  - Add `createManagementApi()` to create typed Management API clients
  - Handle OAuth token auth and renewal automatically
  - Support Logto Cloud and self-hosted instances
