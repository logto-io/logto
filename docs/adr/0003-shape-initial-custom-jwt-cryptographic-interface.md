---
status: accepted
---

# Shape the initial Custom JWT cryptographic interface as two UTF-8 operations

The first cryptographic capability is exposed under the `api.crypto` namespace as asynchronous `sha256(input)` and `hmacSha256({ key, input })` methods; no verification operation is included. Both methods accept text interpreted as UTF-8 and return lowercase hexadecimal strings through `Promise<string>`, keeping the interface deterministic across execution targets and leaving room for future curated operations without flattening them onto the API context.

The methods accept primitive strings without coercion or Unicode normalization. Empty input is valid, an empty HMAC key is not, and lone surrogates follow standard `TextEncoder` replacement semantics. UTF-8 input is limited to 1 MiB and an HMAC key to 64 KiB; invalid types, empty keys, and size violations throw `TypeError` so they retain the existing Custom JWT input-error behavior without introducing cryptography-specific error types. Error messages must be accurate, clear, stable across supported execution targets, and free of input or key material, but the interface does not publish an exhaustive cryptography-specific error catalog.

HMAC keys continue to come from Custom JWT environment variables: examples trim the configured value before calling the method, while the method treats the resulting key as exact input and never falls back to SHA-256. No new key-management or secret-storage system is introduced.
