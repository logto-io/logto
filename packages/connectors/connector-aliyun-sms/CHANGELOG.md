# @logto/connector-aliyun-sms

## 1.5.1

### Patch Changes

- 462e430445: fall back to `TemplateType.Generic` if a usage-specific template is not found
- Updated dependencies [462e430445]
- Updated dependencies [7c87ebc068]
  - @logto/connector-kit@4.7.0

## 1.5.0

### Minor Changes

- 1fb8593659: add full usage types to templates default value

### Patch Changes

- Updated dependencies [ad4f9d6abf]
- Updated dependencies [5da6792d40]
  - @logto/connector-kit@4.6.0

## 1.4.1

### Patch Changes

- Updated dependencies [34964af46]
  - @logto/connector-kit@4.4.0

## 1.4.0

### Minor Changes

- 2961d355d: bump node version to ^22.14.0

### Patch Changes

- Updated dependencies [2961d355d]
  - @logto/connector-kit@4.3.0

## 1.3.0

### Minor Changes

- bca4177c6: add `strictPhoneRegionNumberCheck` to config with default value `false`

  When this configuration is enabled, the connector will assume by default that all phone numbers include a valid region code and rely on this to determine whether the phone number belongs to mainland China. If your users' phone numbers do not include a region code due to historical reasons, their sign-in processes may be affected. Please enable this setting with caution.

### Patch Changes

- Updated dependencies [b0135bcd3]
  - @logto/connector-kit@4.2.0

## 1.2.1

### Patch Changes

- e11e57de8: bump dependencies for security update
- Updated dependencies [e11e57de8]
  - @logto/connector-kit@4.1.1

## 1.2.0

### Minor Changes

- 510f681fa: use tsup for building

  We've updated some of the packages to use `tsup` for building. This will make the build process faster, and should not affect the functionality of the packages.

  Use minor version bump to catch your attention.

## 1.1.2

### Patch Changes

- Updated dependencies [6308ee185]
- Updated dependencies [15953609b]
- Updated dependencies [6308ee185]
  - @logto/connector-kit@4.0.0

## 1.1.1

### Patch Changes

- Updated dependencies [57d97a4df]
- Updated dependencies [57d97a4df]
- Updated dependencies [57d97a4df]
- Updated dependencies [2c10c2423]
  - @logto/connector-kit@3.0.0

## 1.1.0

### Minor Changes

- 31e60811d: use Node 20 LTS for engine requirement.

  Note: We mark it as minor because Logto is shipping with Docker image and it's not a breaking change for users.

### Patch Changes

- 570a4ea9e: support `TemplateType`
- 9089dbf84: upgrade TypeScript to 5.3.3
- Updated dependencies [9089dbf84]
- Updated dependencies [31e60811d]
- Updated dependencies [570a4ea9e]
- Updated dependencies [570a4ea9e]
- Updated dependencies [6befe6014]
  - @logto/connector-kit@2.1.0

## 1.0.2

### Patch Changes

- Updated dependencies [d24aaedf5]
  - @logto/connector-kit@2.0.0

## 1.0.1

### Patch Changes

- 64af2dc88: Fix Aliyun Direct Mail and Aliyun Short Message Service connectors' signature functions.
