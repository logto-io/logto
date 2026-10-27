---
"@logto/connector-kit": patch
---

reduce the CPU cost of validating JSON with `jsonGuard` and `jsonObjectGuard`

The recursive JSON schema is now built once instead of once per nested value, which cuts the time spent validating large JSON payloads. Validation results are unchanged.
