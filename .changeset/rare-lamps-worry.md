---
"@logto/core": patch
---

Support comma separated resource parameter

Some third-party libraries or plugins do not support array of resources, and can only specify `resource` through `additionalParameters` config, e.g. `flutter-appauth`. However, only one resource can be specified at a time in this way. This PR enables comma separated resource parameter support in Logto core service, so that multiple resources can be specified via a single string.

For example: Auth URL like `/oidc/auth?resource=https://example.com/api1,https://example.com/api2` will be interpreted and parsed to Logto core service as `/ordc/auth?resource=https://example.com/api1&resource=https://example.com/api2`.
