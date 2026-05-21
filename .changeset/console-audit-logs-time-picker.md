---
"@logto/console": minor
---

add a time-range picker to the audit logs page with a default of the last 7 days.

the picker offers preset windows (`Last 1 hour` / `Last 24 hours` / `Last 7 days` / `Last 30 days`) plus a custom date range. it scopes every request to a bounded `start_time` / `end_time` window — reducing latency on tenants with very large log volumes — while keeping older logs reachable by widening the range.
