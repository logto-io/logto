---
"@logto/connector-kit": major
---

remove `.catchall()` for `connectorMetadataGuard`

`.catchall()` allows unknown keys to be parsed as metadata. This is troublesome when we want to strip out unknown keys (Zod provides `.strip()` for this purpose but somehow it doesn't work with `.catchall()`).

For data extensibility, we added `customData` field to `ConnectorMetadata` type to store unknown keys. For example, the `fromEmail` field in `connector-logto-email` is not part of the standard metadata, so it should be stored in `customData` in the future.
