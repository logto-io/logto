# @logto/connector-oauth

## 1.0.0

### Major Changes

- 0313b5d: **BREAKING CHANGES**

  - We're committed to ensuring the security of our customers' information and have recently made some changes to our OIDC and OAuth connectors. As a part of this, we have deprecated all other authentication flows and grant types for these connectors and now only support the authorization code flow/grant type. We kindly request that you update any OIDC or OAuth connectors that were configured with other flows and switch to the authorization code flow to ensure the highest level of security for your applications.

- 4ed07d2: bump connector-kit to v1.0.0

### Minor Changes

- 269d701: The console connector configuration page has been changed from JSON format to form view.

### Patch Changes

- 9ff0638: update connector-kit version
- 69acfc8: Update OIDC and OAuth connector README.
- 4ec0889: bump connector-kit version
- d8b9dea: 1. Update `@logto/connector-kit` from `1.0.0-beta.32` to `1.0.0-beta.33`.
- d183d6d: Upgrade connector-kit
- 9deb220: Add UTs for OIDC and OAuth connector happy path.

## 1.0.0-beta.22

### Patch Changes

- 69acfc8: Update OIDC and OAuth connector README.
- 9deb220: Add UTs for OIDC and OAuth connector happy path.

## 1.0.0-beta.21

### Patch Changes

- 4ec0889: bump connector-kit version

## 1.0.0-beta.20

### Minor Changes

- 269d701: The console connector configuration page has been changed from JSON format to form view.

## 1.0.0-beta.19

### Major Changes

- 0313b5d: **BREAKING CHANGES**

  - We're committed to ensuring the security of our customers' information and have recently made some changes to our OIDC and OAuth connectors. As a part of this, we have deprecated all other authentication flows and grant types for these connectors and now only support the authorization code flow/grant type. We kindly request that you update any OIDC or OAuth connectors that were configured with other flows and switch to the authorization code flow to ensure the highest level of security for your applications.

## 1.0.0-beta.18

### Patch Changes

- 9ff0638: update connector-kit version

## 1.0.0-beta.17

### Patch Changes

- d8b9dea: 1. Update `@logto/connector-kit` from `1.0.0-beta.32` to `1.0.0-beta.33`.

## 1.0.0-beta.16

### Patch Changes

- d183d6d: Upgrade connector-kit
