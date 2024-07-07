---
"@logto/experience": minor
"@logto/console": minor
"@logto/core": minor
"@logto/integration-tests": patch
"@logto/phrases": patch
"@logto/schemas": patch
---

support organization logo and sign-in experience override

Now it's able to set light and dark logos for organizations. You can upload the logos in the organization settings page.

Also, it's possible to override the sign-in experience logo from an organization. Simply add the `organization_id` parameter to the authentication request. In most Logto SDKs, it can be done by using the `extraParams` field in the `signIn` method.

For example, in the JavaScript SDK:

```ts
import LogtoClient from '@logto/client';

const logtoClient = new LogtoClient(/* your configuration */);

logtoClient.signIn({
  redirectUri: 'https://your-app.com/callback',
  extraParams: {
    organization_id: '<organization-id>'
  },
});
```

The value `<organization-id>` can be found in the organization settings page.

If you could not find the `extraParams` field in the SDK you are using, please let us know.
