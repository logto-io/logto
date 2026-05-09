---
"@logto/account": patch
---

fix social linking callback in Account Center to preserve connector id

Render the callback through React Router so `useParams()` can correctly read the `connectorId` from the URL and avoid incorrectly showing "social sign-in method is not enabled"
