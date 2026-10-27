---
"@logto/core": patch
"@logto/schemas": patch
---

add a delivery `id` to every webhook payload

A webhook payload carried the hook's id (`hookId`), the event and a timestamp, but nothing that identified the delivery itself, so a receiver that wants to process each delivery once (Logto retries a failed request up to three times) had to hash the whole body. Every payload now carries an `id`, unique per hook and event and kept across the retries of the same request. The payload of the "test webhook" action carries one too.
