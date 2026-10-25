---
"@logto/core": patch
---

stop printing the request body of a failed outbound `got` request in the error logs

`got` keeps the full request options on its `RequestError` as an enumerable property, so logging the error object also printed the request body. For a social connector's token exchange (`code=…&client_id=…&client_secret=…`), a single network timeout towards the identity provider was enough to write the connector's client secret in plain text in the production logs. The error handler now logs the error name, code, message, method, URL and stack, and drops the options.
