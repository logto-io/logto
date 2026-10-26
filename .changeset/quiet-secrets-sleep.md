---
"@logto/core": patch
---

stop printing the request of a failed outbound `got` request in the error logs and telemetry

`got` keeps the full request options on its `RequestError` as an enumerable property, so logging the error object also printed the request: the form body of a social connector's token exchange (`code=…&client_id=…&client_secret=…`), the `Authorization` header or basic-auth password of an email connector, the query string of the connectors that exchange their code through it. A single network timeout towards the provider was enough to write the connector's secret in plain text in the production logs.

The error handler now reduces such an error — and the `ConnectorError` / `RequestError` that wrap it as `data` — to its name, code, message, method, URL (origin and pathname only) and stack frames, before logging it and before reporting it to Application Insights.
