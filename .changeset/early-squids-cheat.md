---
"@logto/core": minor
---

machine-to-machine (M2M) role-based access control (RBAC)

### Summary

This feature enables Logto users to apply role-based access control (RBAC) to their machine-to-machine (M2M) applications.

With the update, Logto users can now effectively manage permissions for their M2M applications, resulting in improved security and flexibility.

Following new APIs are added for M2M role management:

**Applications**
- `POST /applications/:appId/roles` assigns role(s) to the M2M application
- `DELETE /applications/:appId/roles/:roleId` deletes the role from the M2M application
- `GET /applications/:appId/roles` lists all roles assigned to the M2M application

**Roles**
- `POST /roles/:roleId/applications` assigns the role to multiple M2M applications
- `DELETE /roles/:roleId/applications/:appId` removes the M2M application assigned to the role
- `GET /roles/:roleId/applications` lists all M2M applications granted with the role

Updated following API:

**Roles**
- `POST /roles` to specify the role type (either `user` or `machine-to-machine` role)

**Users**
- `POST /users/:userId/roles` to prevent assigning M2M roles to end-users
