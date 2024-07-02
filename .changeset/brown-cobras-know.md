---
"@logto/core": patch
---

build `operationId` for Management API in OpenAPI response (credit to @mostafa)

As per [the specification](https://swagger.io/docs/specification/paths-and-operations/):

> `operationId` is an optional unique string used to identify an operation. If provided, these IDs must be unique among all operations described in your API.

This greatly simplifies the creation of client SDKs in different languages, because it generates more meaningful function names instead of auto-generated ones, like the following examples:

```diff
- org, _, err := s.Client.OrganizationsAPI.ApiOrganizationsIdGet(ctx, req.GetId()).Execute()
+ org, _, err := s.Client.OrganizationsAPI.GetOrganization(ctx, req.GetId()).Execute()
```

```diff
- users, _, err := s.Client.OrganizationsAPI.ApiOrganizationsIdUsersGet(ctx, req.GetId()).Execute()
+ users, _, err := s.Client.OrganizationsAPI.ListOrganizationsUsers(ctx, req.GetId()).Execute()
```
