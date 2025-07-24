---
"@logto/connector-dingtalk-web": minor
"@logto/connector-huggingface": minor
"@logto/connector-mock-social": minor
"@logto/connector-alipay-web": minor
"@logto/connector-wechat-web": minor
"@logto/connector-facebook": minor
"@logto/connector-linkedin": minor
"@logto/connector-azuread": minor
"@logto/connector-discord": minor
"@logto/connector-patreon": minor
"@logto/connector-amazon": minor
"@logto/connector-github": minor
"@logto/connector-gitlab": minor
"@logto/connector-google": minor
"@logto/connector-oauth": minor
"@logto/connector-xiaomi": minor
"@logto/connector-apple": minor
"@logto/connector-slack": minor
"@logto/connector-wecom": minor
"@logto/connector-kook": minor
"@logto/connector-line": minor
"@logto/connector-oidc": minor
"@logto/connector-qq": minor
"@logto/connector-x": minor
"@logto/connector-kit": minor
---

feat: support custom scope in the `getAuthorizationUri` method

This change allows the `getAuthorizationUri` method in the social connectors to accept an extra `scope` parameter, enabling more flexible authorization requests.

If the scope is provided, it will be used in the authorization request; otherwise, the default scope configured in the connector settings will be used.
