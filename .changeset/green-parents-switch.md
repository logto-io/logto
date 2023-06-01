---
"@logto/core": patch
---

## Bump oidc-provider version

Bump oidc-provider version to [v8.2.2](https://github.com/panva/node-oidc-provider/releases/tag/v8.2.2). This version fixes a bug that prevented the revoked scopes from being removed from the access token.

> Issued Access Tokens always only contain scopes that are defined on the respective Resource Server (returned from features.resourceIndicators.getResourceServerInfo).

If the scopes are revoked from the resource server, they should be removed from the newly granted access token. This is now fixed in the new version of oidc-provider.
