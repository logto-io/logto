---
"@logto/core": patch
---

fix the status code 404 error in webhook events payload

Impact webhook events:

- `Role.Scopes.Updated`
- `Organizations.Membership.Updates`

Issue: These webhook event payloads were returning a API response status code of 404 when the webhook was triggered.
Expected: A status code of 200 should be returned, as we only trigger the webhook when the request is successful.
Fix: All webhook event contexts should be created and inserted into the webhook pipeline after the response body and status code are properly set.
