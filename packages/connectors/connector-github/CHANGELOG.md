# @logto/connector-github

## 1.4.1

### Patch Changes

- c95755502: fix `GET /users/emails` API requests break social sign-in flow error

  Previously, the GET /users/emails API was returning a 403 Forbidden error when the endpoint is not accessible. This will break the social sign-in flow in previous version, so we handled this error and return an empty array instead. In this way, the social sign-in flow will continue but with `userEmails` as an empty array, and should provide enough information for further investigation.

## 1.4.0

### Minor Changes

- 0227822b2: fetch GitHub account's private email address list and pick the verified primary email as a fallback

  - Add `user:email` as part of default scope to fetch GitHub account's private email address list
  - Pick the verified primary email among private email address list as a fallback if the user does not set a public email for GitHub account

## 1.3.0

### Minor Changes

- 57d97a4df: return and store social connector raw data

### Patch Changes

- Updated dependencies [57d97a4df]
- Updated dependencies [57d97a4df]
- Updated dependencies [57d97a4df]
- Updated dependencies [2c10c2423]
  - @logto/connector-kit@3.0.0

## 1.2.0

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

## 1.1.1

### Patch Changes

- Updated dependencies [d24aaedf5]
  - @logto/connector-kit@2.0.0

## 1.1.0

### Minor Changes

- 5581f6476: enable configurable `scope` (#3723)
