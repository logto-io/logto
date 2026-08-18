---
"@logto/core": minor
"@logto/schemas": minor
"@logto/console": minor
"@logto/experience": minor
"@logto/account": minor
"@logto/phrases": minor
"@logto/phrases-experience": minor
---

add dynamic app support (OAuth Client ID Metadata Documents)

The dynamic app lets compatible public clients, such as MCP clients, connect to your tenant without registering an application. Following the OAuth Client ID Metadata Documents (CIMD) draft, such a client presents a public HTTPS URL as its `client_id`, and Logto fetches the client metadata from that URL.

Enable it from the dynamic app card in the third-party app section on the create application page in Console. The switch is tenant-level and off by default, and requires the OIDC provider SSRF protection to be active. Control what dynamic app clients can request with the permission settings on the dynamic app page.
