# @logto/connector-saml

## 1.0.0

### Major Changes

- 75103e2: Add `formItems` to `metadata` so that the AC (Admin Console) can display the SAML connector's configuration in a "Form View", making the setup process simpler for our users.

  **BREAKING CHANGES**

  - We updated the SAML connectors `nameIDFormat` type from an array of strings to an enum type because the SAML entity only accepts the first valid value from the array. If you have already configured `nameIDFormat` in your SAML connector, please double-check that it still functions properly. We have also introduced a new "Form View" to streamline the process of creating and updating connectors, which should make it easier to configure connectors.

- 4ed07d2: bump connector-kit to v1.0.0

### Minor Changes

- cffcbe7: Add SAML standard connector, which supports:
  - SP-initiated login
  - Signed/unsigned SAML authentication request with HTTP-Redirect binding
  - Enforced signed SAML assertion (w/ optional encryption choice) using HTTP-POST binding

### Patch Changes

- 9ff0638: update connector-kit version
- 4ec0889: bump connector-kit version

## 1.0.0-beta.4

### Patch Changes

- 4ec0889: bump connector-kit version

## 1.0.0-beta.3

### Major Changes

- 75103e2: Add `formItems` to `metadata` so that the AC (Admin Console) can display the SAML connector's configuration in a "Form View", making the setup process simpler for our users.

  **BREAKING CHANGES**

  - We updated the SAML connectors `nameIDFormat` type from an array of strings to an enum type because the SAML entity only accepts the first valid value from the array. If you have already configured `nameIDFormat` in your SAML connector, please double-check that it still functions properly. We have also introduced a new "Form View" to streamline the process of creating and updating connectors, which should make it easier to configure connectors.

## 1.0.0-beta.2

### Patch Changes

- 9ff0638: update connector-kit version

## 1.0.0-beta.1

### Minor Changes

- cffcbe7: Add SAML standard connector, which supports:
  - SP-initiated login
  - Signed/unsigned SAML authentication request with HTTP-Redirect binding
  - Enforced signed SAML assertion (w/ optional encryption choice) using HTTP-POST binding
