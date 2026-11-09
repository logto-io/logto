---
"@logto/core": patch
---

accept empty display URLs in client ID metadata documents

Some MCP clients that use a client ID metadata document (CIMD) set the optional `client_uri`, `policy_uri`, `tos_uri`, or `logo_uri` properties to an empty string. Logto rejected these documents before the authorization flow started. Logto now treats these empty values as omitted. Non-empty invalid URLs are still rejected.
