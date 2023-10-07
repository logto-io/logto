---
"@logto/core": minor
---

machine-to-machine (M2M) role-based access control (RBAC)

### Summary

This feature enables Logto users to apply role-based access control (RBAC) to their machine-to-machine (M2M) applications.

In Logto, we have enabled Logto users to utilize RBAC to manage their own end-users. However, the methods for M2M connections and authorization are even more prevalent and critical across various use cases than end-user access management.

From now on, Logto enables it's users to manage their M2M applications using RBAC.

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

- `POST /roles` to specify the role type (either `user` or `machine-to-machine` role)

- `POST /users/:userId/roles` to prevent assigning M2M roles to end-users
