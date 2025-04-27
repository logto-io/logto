# @logto/connector-oidc

## 1.5.0

### Minor Changes

- 2961d355d: bump node version to ^22.14.0

### Patch Changes

- 752d406bd: support string-typed boolean claims

  Add an optional `acceptStringTypedBooleanClaims` configuration to `OidcConnectorConfig`, with default value `false`.
  For standard OIDC protocol, some claims such as `email_verified` and `phone_verified` are boolean-typed, but some providers may return them as string-typed. Enabling this option will convert string-typed boolean claims to boolean-typed, which provides better compatibility.
  By enabling this configuration, the connector will accept string-typed boolean ID token claims, such as `email_verified` and `phone_verified`.

- Updated dependencies [2961d355d]
  - @logto/connector-oauth@1.6.0
  - @logto/connector-kit@4.3.0
  - @logto/shared@3.2.0

## 1.4.1

### Patch Changes

- e11e57de8: bump dependencies for security update
- Updated dependencies [e11e57de8]
  - @logto/connector-oauth@1.5.1
  - @logto/connector-kit@4.1.1
  - @logto/shared@3.1.4

## 1.4.0

### Minor Changes

- 510f681fa: use tsup for building

  We've updated some of the packages to use `tsup` for building. This will make the build process faster, and should not affect the functionality of the packages.

  Use minor version bump to catch your attention.

### Patch Changes

- Updated dependencies [510f681fa]
  - @logto/connector-oauth@1.4.0

## 1.3.1

### Patch Changes

- Updated dependencies [6308ee185]
- Updated dependencies [15953609b]
- Updated dependencies [6308ee185]
  - @logto/connector-kit@4.0.0
  - @logto/connector-oauth@1.3.1

## 1.3.0

### Minor Changes

- f9c7a72d5: Support `client_secret_basic` and `client_secret_jwt` token endpoint auth method for oauth & oidc connectors

### Patch Changes

- Updated dependencies [f9c7a72d5]
- Updated dependencies [21bb35b12]
  - @logto/connector-oauth@1.3.0
  - @logto/shared@3.1.1

## 1.2.0

### Minor Changes

- 57d97a4df: return and store social connector raw data

### Patch Changes

- Updated dependencies [57d97a4df]
- Updated dependencies [57d97a4df]
- Updated dependencies [57d97a4df]
- Updated dependencies [2c10c2423]
  - @logto/connector-kit@3.0.0
  - @logto/shared@3.1.0

## 1.1.0

### Minor Changes

- 31e60811d: use Node 20 LTS for engine requirement.

  Note: We mark it as minor because Logto is shipping with Docker image and it's not a breaking change for users.

### Patch Changes

- 9089dbf84: upgrade TypeScript to 5.3.3
- Updated dependencies [acb7fd3fe]
- Updated dependencies [9089dbf84]
- Updated dependencies [31e60811d]
- Updated dependencies [570a4ea9e]
- Updated dependencies [570a4ea9e]
- Updated dependencies [6befe6014]
  - @logto/shared@3.1.0
  - @logto/connector-kit@2.1.0

## 1.0.3

### Patch Changes

- Updated dependencies [d24aaedf5]
  - @logto/connector-kit@2.0.0
  - @logto/shared@3.0.0

## 1.0.2

### Patch Changes

- Updated dependencies [18181f892]
  - @logto/shared@3.0.0

## 1.0.1

### Patch Changes

- Updated dependencies [4945b0be2]
- Updated dependencies [30033421c]
  - @logto/shared@2.0.0
  - @logto/connector-kit@1.1.1
