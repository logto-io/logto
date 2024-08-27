---
"@logto/core": patch
---

introduce new `error_code_key` query parameter in the `koaErrorHandler`.

By default, Logto uses `code` as the error code key in the error response body.
For some third-party connectors, like Google, `code` is considered as a reserved OIDC key,
can't be used as the error code key in the error response body. Any oidc error response body containing `code` will be rejected by Google.

To workaround this, we introduce a new `error_code_key` query parameter to customize the error code key in the error response body.
In the oidc requests, if the `error_code_key` is present in the query string, we will use the value of `error_code_key` as the error code key in the error response body.

example:

```curl
curl -X POST "http://localhost:3001/oidc/token?error_code_key=error_code"
```

```json
{
  "error_code": "oidc.invalid_grant",
  "error": "invalid_grant",
  "error_description": "Invalid value for parameter 'code': 'invalid_code'."
}
```
