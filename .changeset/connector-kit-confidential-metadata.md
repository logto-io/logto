---
"@logto/connector-kit": minor
---

extend `isConfidential` metadata support to `MultilineText` and `Json` form items and export `maskConfidentialConnectorConfig`

- Allow `isConfidential` on `ConnectorConfigFormItemType.MultilineText` (`boolean`) and `ConnectorConfigFormItemType.Json` (`boolean | string[]` for confidential sub-keys or dot-separated paths).
- Export `confidentialValueMask` (`'******'`) and `maskConfidentialConnectorConfig` to mask confidential connector config fields while preserving non-sensitive fields and structure.
- Backfill `isConfidential` annotations across built-in connectors.
