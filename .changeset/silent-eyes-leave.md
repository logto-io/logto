---
"@logto/core-kit": patch
"@logto/core": patch
---

userinfo endpoint will return `organization_data` claim if organization scope is requested

The claim includes all organizations that the user is a member of with the following structure:

```json
{
  "organization_data": [
    {
      "id": "organization_id",
      "name": "organization_name",
      "description": "organization_description",
    }
  ]
}
```
