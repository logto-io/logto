---
"@logto/console": minor
---

feature: machine-to-machine (M2M) role-based access control (RBAC)

### Summary

This feature enables Logto users to apply role-based access control (RBAC) to their machine-to-machine (M2M) applications.

In Logto, we have enabled Logto users to utilize RBAC to manage their own end-users. However, the methods for M2M connections and authorization are even more prevalent and critical across various use cases than end-user access management.

From now on, Logto enables it's users to manage their M2M applications using RBAC.

#### New role type: machine-to-machine

We have introduced a new role type, "machine-to-machine".

- When creating a new role, you can select the type (either "machine-to-machine" or "user" type), with "user" type by default if not specified.
- Logto now ONLY allows the selection of the role type during role creation.

#### Manage "machine-to-machine" roles

You can manage the permissions of a "machine-to-machine" role in the same way as a "user" role.

> Logto's management API resources are available to "machine-to-machine" roles but not for "user" roles.
> "machine-to-machine" roles can only be assigned to M2M applications; and "user" roles can only be assigned to users.

You can assign "machine-to-machine" roles to M2M applications in the following two ways:

- "Applications" on sidebar -> Select an M2M application -> "Roles" tab -> "Assign Roles" button
- "Roles" on sidebar -> Select an M2M role -> "Machine-to-machine apps" tab -> "Assign Applications" button
