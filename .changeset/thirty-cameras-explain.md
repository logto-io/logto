---
"@logto/core": minor
---

update token grant to support organization API resources

Organization roles can be assigned with scopes (permissions) from the API resources, and the token grant now supports this.

Once the user is consent to an application with "resources" assigned, the token grant will now include the scopes inherited from all assigned organization roles.

Users can narrow down the scopes by passing `organization_id` when granting an access token, and the token will only include the scopes from the organization roles of the specified organization, the access token will contain an extra claim `organization_id` to indicate the organization the token is granted for. Then the resource server can use this claim to protect the resource with additional organization-level authorization.

This change is backward compatible, and the existing token grant will continue to work as before.
