---
"@logto/core": minor
"@logto/phrases": minor
"@logto/connector-kit": minor
---

Add validator to ensure the formItems and connectors' config guards are aligned, and following two env variables are added to control the behavior:
 - `IGNORE_CONNECTOR_FORM_VIEW_CONFIG_GUARD_CHECK`: set to `true` to ignore the check on `formItems` and `config` guard's alignment
 - `SHOW_CONNECTOR_LOADING_ERROR_DETAILS`: set to `true` to show the error details when connector fails to load
