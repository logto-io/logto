---
"@logto/core": minor
---

feat: support role names alongside role IDs in organization user role assignment/replacement with merge capability

This update enhances organization user role management APIs to support role assignment by both names and IDs, improving integration flexibility.

### Updates

- Added `organizationRoleNames` parameter to:
  - POST `/api/organizations/{id}/users/{userId}/roles` (assign roles)
  - PUT `/api/organizations/{id}/users/{userId}/roles` (replace roles)
- Make both `organizationRoleNames` and `organizationRoleIds` optional in the above APIs
  - If both are not provided, or empty, an invalid data error will be thrown
- Merge logic when both parameters are provided:
  - Combines roles from `organizationRoleNames` and `organizationRoleIds`
  - Automatically deduplicates entries
  - Validates all names/IDs exist before applying changes
- Maintains backward compatibility with existing integrations using role IDs
