---
"@logto/connector-kit": minor
"@logto/core": minor
---

## Enable connector method `getUserInfo` read and write access to DB

Logto connectors are designed to be stateless to the extent possible and practical, but with the recent addition of database read and write access, connectors can now store persistent information. For example, connectors can now store access tokens and refresh tokens to minimize number of requests to social vendor's APIs.
