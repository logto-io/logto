---
"@logto/core": patch
---

introduce new `parse_error` query parameter flag. The value of `parse_error` can only be `false`.

By default, Logto returns the parsed error code and error description in all the `RequestError` error responses. This is to ensure the error responses are consistent and easy to understand.

However, when integrating Logto with Google OAuth, the error response body containing `code` will be rejected by Google. `code` is considered as a reserved OIDC key, can't be used as the error code key in the error response body.

To workaround this, we add a new `parse_error` query parameter flag. When parsing the OIDC error body, if the `parse_error` is set to false, only oidc error body will be returned.

example:

```curl
curl -X POST "http://localhost:3001/oidc/token?parse_error=false"
```

```json
{
  "error": "invalid_grant",
  "error_description": "Invalid value for parameter 'code': 'invalid_code'."
}
```
