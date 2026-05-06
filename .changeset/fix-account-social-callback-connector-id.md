---
"@logto/account": patch
---

Fix social linking callback in Account Center incorrectly showing "social sign-in method is not enabled". The callback is now rendered through React Router so `useParams()` can correctly read the `connectorId` from the URL.
