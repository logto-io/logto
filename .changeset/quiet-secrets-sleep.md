---
"@logto/core": patch
---

stop exposing the request of a failed outbound `got` request in error responses, audit logs, error logs and telemetry

`got` keeps the full request options on its `RequestError` as an enumerable property: the form body of a social connector's token exchange (`code=…&client_id=…&client_secret=…`), the `Authorization` header or basic-auth password of an email connector, the query string of the connectors that exchange their code through it. Several connectors wrap such an error as the `data` of a `ConnectorError`, so a single network timeout towards the provider used to put the connector's secret in the error logs, in Application Insights, in the audit log entry of the request, and — through the `connector.general` response the connector error handler builds from it — in the body returned to the end user's browser.

The error handlers now reduce such an error, and the `ConnectorError` / `RequestError` that wrap it, to its name, code and message (plus method and URL, origin and pathname only, in the server log) before logging, exporting or returning it.
