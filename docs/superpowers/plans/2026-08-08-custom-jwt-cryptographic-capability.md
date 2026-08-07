# Custom JWT Cryptographic Capability — Design and Implementation Plan

**Status:** Ready for confirmation; implementation has not begun.

**Goal:** Give self-hosted Custom JWT scripts development-only, out-of-the-box SHA-256 and HMAC-SHA-256 operations without exposing a general cryptographic runtime or widening the existing script trust model.

**Architecture:** Extend the existing Custom JWT API context with a small `api.crypto` interface. A private Core module validates and UTF-8 encodes script inputs, enforces portable resource limits, invokes Node's native cryptographic primitives, and returns canonical lowercase hexadecimal output. The module is available only in self-hosted Logto with development features enabled. Actions, Logto Cloud, Cloudflare Workers, and Azure Functions do not receive the capability in this version.

**Related decisions:**

- [ADR 0001](../../adr/0001-scope-custom-jwt-cryptographic-capabilities.md) — initial product and execution-target scope
- [ADR 0002](../../adr/0002-expose-curated-cryptographic-operations.md) — curated API-context operations instead of unrestricted crypto
- [ADR 0003](../../adr/0003-shape-initial-custom-jwt-cryptographic-interface.md) — initial method and data contract
- [ADR 0004](../../adr/0004-separate-cryptographic-capability-from-sandbox-hardening.md) — trusted-script model and sandbox-hardening separation
- [Domain language](../../../CONTEXT.md)

---

## Domain language

- **Custom JWT** is the product capability.
- A **Custom JWT script** is tenant-authored code with a `getCustomJwtClaims` entry point.
- **Custom claims** are the fields returned by that script.
- The **API context** is the host-provided `api` object containing fixed privileged operations.
- The **cryptographic capability** is the curated `api.crypto` interface.
- Self-hosted execution retains its **trusted-script model**; the current local VM is not a security sandbox.

## Scope

### Included

- `api.crypto.sha256()`
- `api.crypto.hmacSha256()`
- UTF-8 text input
- Lowercase hexadecimal output
- Existing Custom JWT environment variables as the source of HMAC keys
- Self-hosted development-feature execution
- Console authoring types, guidance, examples, and localized copy
- Shared conformance vectors suitable for future execution targets

### Excluded

- Actions
- Logto Cloud, Cloudflare Worker, and Azure Function execution
- HMAC verification
- Dynamic algorithm selection
- Full Web Crypto exposure
- Binary, streaming, or structured input
- Base64 or base64url output
- Encryption, digital signatures, password hashing, and key derivation
- KMS, key handles, managed key rotation, or a dedicated secret UI
- Repairing the current self-hosted VM isolation model
- Changing existing `fetch` or network-egress behavior

## Public interface

The shared Core/schema type reflects that the capability is conditional:

```ts
type CustomJwtCryptographicCapability = Readonly<{
  sha256: (input: string) => Promise<string>;
  hmacSha256: (options: Readonly<{ key: string; input: string }>) => Promise<string>;
}>;

type CustomJwtApiContext = Readonly<{
  denyAccess: (message?: string) => never;
  crypto?: CustomJwtCryptographicCapability;
}>;
```

When the feature is available, Console authoring types present `crypto` as required so scripts can call `api.crypto.sha256()` directly. When unavailable, Console authoring types omit the property entirely.

Both methods are asynchronous on every target. Node may compute synchronously inside the private implementation, but the public interface returns a resolved Promise so future Web Crypto implementations do not change the authoring contract.

## Availability

The capability exists only when both conditions are true:

```ts
isDevFeaturesEnabled && !isCloud
```

The same high-level “Custom JWT cryptographic capability” comment must identify every guard so the guards can be found and removed together when the feature is released.

The guard covers:

- Core API-context construction for script testing and real token issuance;
- Console type definitions, guidance, and samples;
- related tests.

When the guard is false, `api.crypto` is absent rather than present-but-throwing. Cloud execution must never advertise a capability its remote runner does not implement.

If a saved development-feature script still calls `api.crypto` after development features are disabled, the call fails because the capability is absent. The failure follows the existing `blockIssuanceOnError` behavior; there is no script analysis, migration, compatibility shim, or cryptographic fallback.

No changeset is added while the capability remains behind `isDevFeaturesEnabled`.

## Data contract

### Text encoding

- Inputs must be primitive JavaScript strings; there is no implicit `String(value)` coercion.
- Strings are encoded as UTF-8 using standard `TextEncoder` semantics.
- Unicode normalization is not performed.
- Lone surrogates are replaced with U+FFFD as part of standard encoding.
- Empty message input is valid.
- Limits are measured after UTF-8 encoding, not with JavaScript `string.length`.

### HMAC key

- The key must be a non-empty primitive string.
- The method uses the key exactly as provided and never trims or otherwise normalizes it.
- Console examples retrieve the key from `environmentVariables`, call `.trim()` explicitly, and reject an empty result before invoking HMAC.
- Documentation recommends a high-entropy key without whitespace.
- Missing or invalid keys never fall back to plain SHA-256.

### Limits

- SHA-256/HMAC input: at most 1,048,576 UTF-8 bytes.
- HMAC key: at most 65,536 UTF-8 bytes.
- Type, empty-key, and size validation failures use `TypeError` so they retain the existing Custom JWT input-error path.
- No cryptography-specific public error class or error code is introduced.

### Output

- SHA-256 and HMAC-SHA-256 both produce exactly 32 bytes internally.
- Public output is exactly 64 lowercase hexadecimal ASCII characters.
- There is no `0x` prefix, separator, padding, or configurable output encoding.

Equivalent formulas:

```text
lowercaseHex(SHA-256(UTF-8(input)))
lowercaseHex(HMAC-SHA-256(UTF-8(key), UTF-8(input)))
```

## Security model

The cryptographic capability must not widen the current host-access surface:

- `api.crypto` is a fixed, recursively frozen object.
- Tenant payloads cannot provide or replace `api` or `api.crypto`.
- Algorithms and output encodings are not tenant-selected strings.
- Inputs are ordinary data and are never interpolated into executable source.
- The implementation does not use `eval`, `Function`, or generated source.
- Native `node:crypto`, `Buffer`, `CryptoKey`, and `SubtleCrypto` objects are not exposed to the script.
- Native implementation references are captured before tenant code runs.
- Keys and inputs do not enter logs, telemetry, caches, custom claims, or error messages through the capability implementation.
- Existing Custom JWT execution continues omitting scripts and environment variables from its structured token-issuance log payload.

These guarantees are deliberately narrower than sandbox isolation. Node documents that `node:vm` is not a security mechanism, and the current runner already passes host functions such as `fetch` and `api.denyAccess` into the VM. Custom JWT authors in self-hosted Logto therefore remain trusted like server administrators. Secure capability-only execution requires a separate runner-hardening project.

## Module design

Create one private, deep cryptographic capability module in Core. Its public test surface is the two-method interface above; internally it owns:

- runtime validation;
- UTF-8 encoding and encoded-byte length checks;
- native SHA-256/HMAC-SHA-256 invocation;
- output-length assertion and lowercase-hex encoding;
- safe, clear error construction;
- recursive freezing of the exposed capability.

The first version directly uses Node built-ins:

- `TextEncoder` for bytes;
- `createHash('sha256')`;
- `createHmac('sha256', keyBytes)`;
- hexadecimal digest output.

Do not add a `CryptoBackend` or `NodeCryptoAdapter` interface yet. Only one implementation exists, so an Adapter seam would be hypothetical. Introduce an internal Adapter seam when a second execution target is actually implemented.

The generic ScriptRunner interface does not gain a capability registry. Custom JWT context construction owns this capability; Actions remain unchanged.

## Expected file changes

- **Modify** `packages/schemas/src/types/logto-config/jwt-customizer.ts`
  - add the optional shared cryptographic-capability type.
- **Create** a private Core Custom JWT cryptographic-capability module and its unit tests.
- **Modify** `packages/core/src/libraries/jwt-customizer.ts`
  - construct and freeze `api.crypto` only for self-hosted dev-feature execution.
- **Modify** Core Custom JWT tests
  - cover enabled, disabled, Cloud, testing, and real issuance paths.
- **Modify** `packages/console/scripts/custom-jwt-customizer-type-definition.ts`
  - make the authoring API-context definition conditional.
- **Regenerate** `packages/console/src/consts/jwt-customizer-type-definition.ts`.
- **Modify** `packages/console/src/pages/CustomizeJwtDetails/utils/config.tsx`
  - add authoring definitions and examples only when supported.
- **Modify** the Custom JWT instruction UI
  - add cryptographic-capability guidance behind the complete guard.
- **Modify** `packages/phrases/src/locales/*/translation/admin-console/jwt-claims.ts`
  - synchronize the new copy across every locale.
- **Modify/add tests** for Console visibility, type wiring, and examples.

No HTTP request or response field changes, so this design does not add an OpenAPI schema property.

## Documentation requirements

Console guidance must explain:

- exact method signatures and Promise usage;
- exact UTF-8/lowercase-hex formulas;
- explicit `.trim()` of a key read from `environmentVariables`;
- key entropy and no-whitespace recommendations;
- empty-key and input-size behavior;
- that SHA-256 does not hide enumerable identifiers such as email addresses or phone numbers;
- that HMAC is the appropriate operation for a secret-keyed stable identifier;
- that neither method is appropriate for password storage;
- that environment variables are visible to authorized Custom JWT administrators and the execution runner and are not a new managed-key system;
- that rotating an HMAC key changes every derived value, and scripts needing a migration should carry an application-defined key version and explicitly implement any dual-value period;
- that multiple values need an unambiguous caller-defined serialization, with `JSON.stringify([value1, value2])` as the simple same-runtime example and canonical serialization left to cross-language integrations;
- the self-hosted trusted-script model and existing sandbox warning.

New phrase entries must be added to all locale files in the same change.

## Conformance and acceptance tests

The interface is the primary test surface. The corpus includes:

- standard SHA-256 known-answer vectors;
- standard HMAC-SHA-256 known-answer vectors;
- empty input, ASCII, Chinese text, emoji, NUL, and lone surrogates;
- long HMAC keys;
- exact maximum sizes and one-byte-over-limit cases after UTF-8 encoding;
- wrong types, missing options, and empty key;
- strings containing quotes, backticks, `${...}`, comment syntax, and newlines, proving they are hashed literally;
- exact 64-character lowercase-hex output;
- immutable `api` and `api.crypto` behavior;
- absence when development features are disabled;
- absence in Cloud mode;
- absence from Actions;
- errors and telemetry that do not contain input or key material.

The vectors and expected results are execution-target-neutral. A future Cloudflare or Azure implementation must pass the same corpus before the capability is advertised on that target.

## Rollout

1. Implement and verify the self-hosted capability behind `isDevFeaturesEnabled && !isCloud`.
2. Keep the capability out of release notes and changesets while development-only.
3. If Cloud support is later required, implement each remote runner and run the shared conformance corpus.
4. Only after every intended target is ready, remove this feature's guard and add a user-facing changeset describing the final capability.

## Lifecycle guidance

- The capability does not manage HMAC key rotation. Changing a key changes the output; scripts that require a migration carry their own key-version claim and explicitly implement any dual-key or dual-value period.
- Disabling development features removes `api.crypto`, including for previously saved scripts. Existing Custom JWT error-handling configuration determines whether an uncaught failure blocks token issuance.
- The capability does not canonicalize structured data. Callers own serialization; a JSON array is an unambiguous simple example, while cross-language integrations must agree on their own canonical representation.
