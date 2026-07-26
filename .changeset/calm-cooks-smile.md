---
'@logto/core': patch
---

atomic passwordless connector insert and old cleanup in a transaction

Previously, creating a new email or SMS connector ran the INSERT and the DELETE of old connectors as two separate statements. A crash between them left duplicate connectors. Now both operations are wrapped in a single database transaction, so either both succeed or neither does.
