---
"@logto/core": minor
---

support form post callback for social connectors

Add the `POST /callback/:connectorId` endpoint to handle the form post callback for social connectors. This usefull for the connectors that require a form post callback to complete the authentication process, such as Apple.
