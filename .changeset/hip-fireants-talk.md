---
"@logto/console": minor
"@logto/core": minor
"@logto/schemas": minor
---

add new webhook events

We introduce a new event type `DataHook` to unlock a series of events that can be triggered by data updates (mostly Management API):

- User.Created
- User.Deleted
- User.Data.Updated
- User.SuspensionStatus.Updated
- Role.Created
- Role.Deleted
- Role.Data.Updated
- Role.Scopes.Updated
- Scope.Created
- Scope.Deleted
- Scope.Data.Updated
- Organization.Created
- Organization.Deleted
- Organization.Data.Updated
- Organization.Membership.Updated
- OrganizationRole.Created
- OrganizationRole.Deleted
- OrganizationRole.Data.Updated
- OrganizationRole.Scopes.Updated
- OrganizationScope.Created
- OrganizationScope.Deleted
- OrganizationScope.Data.Updated

DataHook events are triggered when the data associated with the event is updated via management API request or user interaction actions.

### Management API triggered events

| API endpoint                                               | Event                                                       |
| ---------------------------------------------------------- | ----------------------------------------------------------- |
| POST /users                                                | User.Created                                                |
| DELETE /users/:userId                                      | User.Deleted                                                |
| PATCH /users/:userId                                       | User.Data.Updated                                           |
| PATCH /users/:userId/custom-data                           | User.Data.Updated                                           |
| PATCH /users/:userId/profile                               | User.Data.Updated                                           |
| PATCH /users/:userId/password                              | User.Data.Updated                                           |
| PATCH /users/:userId/is-suspended                          | User.SuspensionStatus.Updated                               |
| POST /roles                                                | Role.Created, (Role.Scopes.Update)                          |
| DELETE /roles/:id                                          | Role.Deleted                                                |
| PATCH /roles/:id                                           | Role.Data.Updated                                           |
| POST /roles/:id/scopes                                     | Role.Scopes.Updated                                         |
| DELETE /roles/:id/scopes/:scopeId                          | Role.Scopes.Updated                                         |
| POST /resources/:resourceId/scopes                         | Scope.Created                                               |
| DELETE /resources/:resourceId/scopes/:scopeId              | Scope.Deleted                                               |
| PATCH /resources/:resourceId/scopes/:scopeId               | Scope.Data.Updated                                          |
| POST /organizations                                        | Organization.Created                                        |
| DELETE /organizations/:id                                  | Organization.Deleted                                        |
| PATCH /organizations/:id                                   | Organization.Data.Updated                                   |
| PUT /organizations/:id/users                               | Organization.Membership.Updated                             |
| POST /organizations/:id/users                              | Organization.Membership.Updated                             |
| DELETE /organizations/:id/users/:userId                    | Organization.Membership.Updated                             |
| POST /organization-roles                                   | OrganizationRole.Created, (OrganizationRole.Scopes.Updated) |
| DELETE /organization-roles/:id                             | OrganizationRole.Deleted                                    |
| PATCH /organization-roles/:id                              | OrganizationRole.Data.Updated                               |
| POST /organization-scopes                                  | OrganizationScope.Created                                   |
| DELETE /organization-scopes/:id                            | OrganizationScope.Deleted                                   |
| PATCH /organization-scopes/:id                             | OrganizationScope.Data.Updated                              |
| PUT /organization-roles/:id/scopes                         | OrganizationRole.Scopes.Updated                             |
| POST /organization-roles/:id/scopes                        | OrganizationRole.Scopes.Updated                             |
| DELETE /organization-roles/:id/scopes/:organizationScopeId | OrganizationRole.Scopes.Updated                             |

### User interaction triggered events

| User interaction action  | Event             |
| ------------------------ | ----------------- |
| User email/phone linking | User.Data.Updated |
| User MFAs linking        | User.Data.Updated |
| User social/SSO linking  | User.Data.Updated |
| User password reset      | User.Data.Updated |
| User registration        | User.Created      |
