# @logto/connector-mock-email

## 2.3.0

### Minor Changes

- 52a618069: add new template type MfaVerification for verification code

If you are using Email/SMS as a MFA method, you should update your connector configuration to include the new template type `MfaVerification` for verification code.

## 2.2.1

### Patch Changes

- Updated dependencies [34964af46]
  - @logto/connector-kit@4.4.0

## 2.2.0

### Minor Changes

- 2961d355d: bump node version to ^22.14.0

### Patch Changes

- Updated dependencies [2961d355d]
  - @logto/connector-kit@4.3.0

## 2.1.1

### Patch Changes

- e11e57de8: bump dependencies for security update
- Updated dependencies [e11e57de8]
  - @logto/connector-kit@4.1.1

## 2.1.0

### Minor Changes

- 510f681fa: use tsup for building

  We've updated some of the packages to use `tsup` for building. This will make the build process faster, and should not affect the functionality of the packages.

  Use minor version bump to catch your attention.

## 2.0.2

### Patch Changes

- Updated dependencies [6308ee185]
- Updated dependencies [15953609b]
- Updated dependencies [6308ee185]
  - @logto/connector-kit@4.0.0

## 2.0.1

### Patch Changes

- Updated dependencies [57d97a4df]
- Updated dependencies [57d97a4df]
- Updated dependencies [57d97a4df]
- Updated dependencies [2c10c2423]
  - @logto/connector-kit@3.0.0

## 2.0.0

### Major Changes

- 6befe6014: update `writeFile` path according to the connector type

  - SMS connector: `/tmp/logto_mock_sms_record.txt`
  - Email connector: `/tmp/logto_mock_email_record.txt`

### Minor Changes

- 31e60811d: use Node 20 LTS for engine requirement.

  Note: We mark it as minor because Logto is shipping with Docker image and it's not a breaking change for users.

### Patch Changes

- 9089dbf84: upgrade TypeScript to 5.3.3
- Updated dependencies [9089dbf84]
- Updated dependencies [31e60811d]
- Updated dependencies [570a4ea9e]
- Updated dependencies [570a4ea9e]
- Updated dependencies [6befe6014]
  - @logto/connector-kit@2.1.0

## 1.0.1

### Patch Changes

- Updated dependencies [d24aaedf5]
  - @logto/connector-kit@2.0.0
