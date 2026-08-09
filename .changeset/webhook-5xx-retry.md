---
"@logto/core": patch
---

retry webhook deliveries on HTTP 5xx responses

Webhook POST requests now retry up to 3 times when the endpoint returns any 5xx status, matching the documented delivery contract.
