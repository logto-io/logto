---
"@logto/schemas": patch
---

restore the `users` and `service_logs` indexes dropped by the tenant-ID widening, building each concurrently, and remove the temporary `service_logs` covering indexes
