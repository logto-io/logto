---
"@logto/core": minor
"@logto/schemas": minor
---

add a `deliveryId` to every webhook payload

Every webhook payload now carries a `deliveryId`: unique per hook and event, kept across the retries of the same request, so a receiver can process each delivery exactly once without hashing the body. The same value is the id of the audit log entry that records the delivery, so a `deliveryId` reported by a receiver can be opened from the webhook's recent requests in the Console or fetched with `GET /api/logs/:id`. The payload of the "test webhook" action carries one too.
