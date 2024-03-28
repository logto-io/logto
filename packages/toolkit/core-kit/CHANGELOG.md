# Change Log

## 2.4.0

### Minor Changes

- abffb9f95: full oidc standard claims support

  We have added support for the remaining [OpenID Connect standard claims](https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims). Now, these claims are accessible in both ID tokens and the response from the `/me` endpoint.

  Additionally, we adhere to the standard scopes - claims mapping. This means that you can retrieve most of the profile claims using the `profile` scope, and the `address` claim can be obtained by using the `address` scope.

  For all newly introduced claims, we store them in the `user.profile` field.

  > ![Note]
  > Unlike other database fields (e.g. `name`), the claims stored in the `profile` field will fall back to `undefined` rather than `null`. We refrain from using `?? null` here to reduce the size of ID tokens, since `undefined` fields will be stripped in tokens.

### Patch Changes

- @logto/shared@3.1.0

## 2.3.0

### Minor Changes

- 31e60811d: use Node 20 LTS for engine requirement.

  Note: We mark it as minor because Logto is shipping with Docker image and it's not a breaking change for users.

### Patch Changes

- 9089dbf84: upgrade TypeScript to 5.3.3
- Updated dependencies [acb7fd3fe]
- Updated dependencies [9089dbf84]
- Updated dependencies [31e60811d]
  - @logto/shared@3.1.0
  - @logto/language-kit@1.1.0

## 2.2.1

### Patch Changes

- b4f702a86: userinfo endpoint will return `organization_data` claim if organization scope is requested

  The claim includes all organizations that the user is a member of with the following structure:

  ```json
  {
    "organization_data": [
      {
        "id": "organization_id",
        "name": "organization_name",
        "description": "organization_description"
      }
    ]
  }
  ```

## 2.2.0

### Minor Changes

- 2c340d379: support `roles` scope for ID token to issue `roles` claim

## 2.1.2

### Patch Changes

- Updated dependencies [18181f892]
  - @logto/shared@3.0.0

## 2.1.1

### Patch Changes

- 6f5a0acad: fix a bug that prevents user from customizing i18n translations in Sign-in Experience config

## 2.1.0

### Minor Changes

- e8b0b1d02: feature: password policy

  ### Summary

  This feature enables custom password policy for users. Now it is possible to guard with the following rules when a user is creating a new password:

  - Minimum length (default: `8`)
  - Minimum character types (default: `1`)
  - If the password has been pwned (default: `true`)
  - If the password is exactly the same as or made up of the restricted phrases:
    - Repetitive or sequential characters (default: `true`)
    - User information (default: `true`)
    - Custom words (default: `[]`)

  If you are an existing Logto Cloud user or upgrading from a previous version, to ensure a smooth experience, we'll keep the original policy as much as possible:

  > The original password policy requires a minimum length of 8 and at least 2 character types (letters, numbers, and symbols).

  Note in the new policy implementation, it is not possible to combine lower and upper case letters into one character type. So the original password policy will be translated into the following:

  - Minimum length: `8`
  - Minimum character types: `2`
  - Pwned: `false`
  - Repetitive or sequential characters: `false`
  - User information: `false`
  - Custom words: `[]`

  If you want to change the policy, you can do it:

  - Logto Console -> Sign-in experience -> Password policy.
  - Update `passwordPolicy` property in the sign-in experience via Management API.

  ### Side effects

  - All new users will be affected by the new policy immediately.
  - Existing users will not be affected by the new policy until they change their password.
  - We removed password restrictions when adding or updating a user via Management API.

### Patch Changes

- Updated dependencies [310698b0d]
  - @logto/shared@2.0.1

## 2.0.1

### Patch Changes

- e9c2c9a6d: Add new font tokens in core-kit

## 2.0.0

### Major Changes

- 30033421c: - connector-kit: add `DemoConnector` type and demo connector ids
  - core-kit: remove nanoid utils, add tenant model utils
  - shared: remove models, add database types and universal export

### Patch Changes

- Updated dependencies [4945b0be2]
- Updated dependencies [30033421c]
  - @logto/shared@2.0.0

## 1.1.0

### Minor Changes

- 343b1090f: Allow admin tenant admin to create tenants without limitation

## 1.0.0

### Minor Changes

- 738675a7d: ## Improvements

  - Exported seed constants and schemas.
  - Add ID generation utilities `buildIdGenerator()` and `generateStandardId()`.

### Patch Changes

- Updated dependencies [738675a7d]
  - @logto/language-kit@1.0.0

## 1.0.0-beta.30

### Minor Changes

- 738675a7: ## Improvements

  - Exported seed constants and schemas.
  - Add ID generation utilities `buildIdGenerator()` and `generateStandardId()`.

### Patch Changes

- Updated dependencies [738675a7]
  - @logto/language-kit@1.0.0-beta.30

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [1.0.0-beta.29](https://github.com/logto-io/toolkit/compare/v1.0.0-beta.28...v1.0.0-beta.29) (2022-12-07)

### Bug Fixes

- exports info and lock dep version ([#45](https://github.com/logto-io/toolkit/issues/45)) ([2ac83b4](https://github.com/logto-io/toolkit/commit/2ac83b4f0ff17579456569fb67ba018ac493c1af))

## [1.0.0-beta.28](https://github.com/logto-io/toolkit/compare/v1.0.0-beta.27...v1.0.0-beta.28) (2022-12-06)

**Note:** Version bump only for package @logto/core-kit

## [1.0.0-beta.26](https://github.com/logto-io/toolkit/compare/v1.0.0-beta.25...v1.0.0-beta.26) (2022-11-23)

**Note:** Version bump only for package @logto/core-kit

## [1.0.0-beta.25](https://github.com/logto-io/toolkit/compare/v1.0.0-beta.24...v1.0.0-beta.25) (2022-11-22)

### Bug Fixes

- **core:** declarations ([#39](https://github.com/logto-io/toolkit/issues/39)) ([3140fdb](https://github.com/logto-io/toolkit/commit/3140fdbcc2db76bb76b4a5f5a5070de0dc12ff40))

## [1.0.0-beta.24](https://github.com/logto-io/toolkit/compare/v1.0.0-beta.23...v1.0.0-beta.24) (2022-11-22)

**Note:** Version bump only for package @logto/core-kit

## [1.0.0-beta.21](https://github.com/logto-io/toolkit/compare/v1.0.0-beta.20...v1.0.0-beta.21) (2022-11-11)

**Note:** Version bump only for package @logto/core-kit

## [1.0.0-beta.20](https://github.com/logto-io/toolkit/compare/v1.0.0-beta.19...v1.0.0-beta.20) (2022-10-21)

**Note:** Version bump only for package @logto/core-kit

## [1.0.0-beta.19](https://github.com/logto-io/toolkit/compare/v1.0.0-beta.18...v1.0.0-beta.19) (2022-10-19)

**Note:** Version bump only for package @logto/core-kit

## [1.0.0-beta.18](https://github.com/logto-io/toolkit/compare/v1.0.0-beta.17...v1.0.0-beta.18) (2022-10-12)

### Bug Fixes

- export url utilities in index file ([#23](https://github.com/logto-io/toolkit/issues/23)) ([0a7b4c8](https://github.com/logto-io/toolkit/commit/0a7b4c836fe6d566fc051fcf185df4dac352e308))

## [1.0.0-beta.17](https://github.com/logto-io/toolkit/compare/v1.0.0-beta.16...v1.0.0-beta.17) (2022-10-12)

**Note:** Version bump only for package @logto/core-kit

## [1.0.0-beta.16](https://github.com/logto-io/toolkit/compare/v1.0.0-beta.15...v1.0.0-beta.16) (2022-09-28)

### Bug Fixes

- **core,language:** avoid using path aliases ([#15](https://github.com/logto-io/toolkit/issues/15)) ([22db3ed](https://github.com/logto-io/toolkit/commit/22db3ed2daf3ee5906ffc864bb9bed1a826df842))

## [1.0.0-beta.15](https://github.com/logto-io/toolkit/compare/v1.0.0-beta.14...v1.0.0-beta.15) (2022-09-27)

### Features

- **language,core,connector:** init language-kit package ([#14](https://github.com/logto-io/toolkit/issues/14)) ([9a74fc4](https://github.com/logto-io/toolkit/commit/9a74fc4d34c9ce277b8734ab78735549dc3a3cda))

## [1.0.0-beta.14](https://github.com/logto-io/toolkit/compare/v1.0.0-beta.13...v1.0.0-beta.14) (2022-09-23)

### Bug Fixes

- remove unused file utils to avoid importing fs in browser ([#11](https://github.com/logto-io/toolkit/issues/11)) ([e1bda93](https://github.com/logto-io/toolkit/commit/e1bda93d1e95974f5e7128c48bb3a342cc9de358))

## [1.0.0-beta.13](https://github.com/logto-io/toolkit/compare/v1.0.0-beta.12...v1.0.0-beta.13) (2022-09-19)

**Note:** Version bump only for package @logto/core-kit

## [1.0.0-beta.12](https://github.com/logto-io/toolkit/compare/v1.0.0-beta.11...v1.0.0-beta.12) (2022-09-17)

**Note:** Version bump only for package @logto/core-kit

## [1.0.0-beta.11](https://github.com/logto-io/toolkit/compare/v1.0.0-beta.10...v1.0.0-beta.11) (2022-09-16)

**Note:** Version bump only for package @logto/core-kit

## 1.0.0-beta.10 (2022-09-16)

### Features

- initial commit ([56a4968](https://github.com/logto-io/toolkit/commit/56a496848168a4a9ae9ac7af83d51f1b8a6afe2c))

## [1.0.0-beta.9](https://github.com/logto-io/logto/compare/v1.0.0-beta.8...v1.0.0-beta.9) (2022-09-07)

### Features

- add Portuguese translation ([f268ecb](https://github.com/logto-io/logto/commit/f268ecb1a8d57d1e33225bec8852f3bc377dd478))

### Bug Fixes

- **console,ui:** fix locale guard issue in settings page ([e200578](https://github.com/logto-io/logto/commit/e2005780a39fa7b5f5c5e406f37805913b684c18))

## [1.0.0-beta.8](https://github.com/logto-io/logto/compare/v1.0.0-beta.6...v1.0.0-beta.8) (2022-09-01)

**Note:** Version bump only for package @logto/shared

## [1.0.0-beta.6](https://github.com/logto-io/logto/compare/v1.0.0-beta.5...v1.0.0-beta.6) (2022-08-30)

**Note:** Version bump only for package @logto/shared

## [1.0.0-beta.5](https://github.com/logto-io/logto/compare/v1.0.0-beta.4...v1.0.0-beta.5) (2022-08-19)

**Note:** Version bump only for package @logto/shared

## [1.0.0-beta.4](https://github.com/logto-io/logto/compare/v1.0.0-beta.3...v1.0.0-beta.4) (2022-08-11)

### Bug Fixes

- **shared:** fix dark color generator ([#1719](https://github.com/logto-io/logto/issues/1719)) ([3deb98c](https://github.com/logto-io/logto/commit/3deb98c18dfe54abda53e6de7592f40924e1f2f3))

## [1.0.0-beta.3](https://github.com/logto-io/logto/compare/v1.0.0-beta.2...v1.0.0-beta.3) (2022-08-01)

### Features

- **console:** add Next.js integration guide in admin console ([7d3f947](https://github.com/logto-io/logto/commit/7d3f94738f495de98464d23b6fdf18214d59005e))

## [1.0.0-beta.1](https://github.com/logto-io/logto/compare/v1.0.0-beta.0...v1.0.0-beta.1) (2022-07-19)

**Note:** Version bump only for package @logto/shared

## [1.0.0-beta.0](https://github.com/logto-io/logto/compare/v1.0.0-alpha.4...v1.0.0-beta.0) (2022-07-14)

**Note:** Version bump only for package @logto/shared

## [1.0.0-alpha.3](https://github.com/logto-io/logto/compare/v1.0.0-alpha.2...v1.0.0-alpha.3) (2022-07-07)

**Note:** Version bump only for package @logto/shared

### [0.1.2-alpha.5](https://github.com/logto-io/logto/compare/v0.1.2-alpha.4...v0.1.2-alpha.5) (2022-07-03)

**Note:** Version bump only for package @logto/shared

### [0.1.2-alpha.1](https://github.com/logto-io/logto/compare/v0.1.2-alpha.0...v0.1.2-alpha.1) (2022-07-02)

**Note:** Version bump only for package @logto/shared

### [0.1.1-alpha.0](https://github.com/logto-io/logto/compare/v0.1.0-internal...v0.1.1-alpha.0) (2022-07-01)

### Features

- **console,ui:** generate dark mode color in console ([#1231](https://github.com/logto-io/logto/issues/1231)) ([f72b21d](https://github.com/logto-io/logto/commit/f72b21d1602ab0fb35ef3e7d84f6c8ebd7e18b08))
- **console:** add details summary component in guides ([693c4f0](https://github.com/logto-io/logto/commit/693c4f0422eb312190f2c7b0673e3ceaa8c41213))
- **core,shared:** get /dashboard/users/active ([#953](https://github.com/logto-io/logto/issues/953)) ([1420bb2](https://github.com/logto-io/logto/commit/1420bb28cec9c0e20b4d0645a58e436135f87c83))
- **demo-app:** implement (part 2) ([85a055e](https://github.com/logto-io/logto/commit/85a055efa4358cfb69c0d74f7aeaeb0bade024af))
- **demo-app:** implementation ([#982](https://github.com/logto-io/logto/issues/982)) ([7f4f4f8](https://github.com/logto-io/logto/commit/7f4f4f84addf8a25c3d30f1ac3ceeef460afcf17))
- **demo-app:** init ([#979](https://github.com/logto-io/logto/issues/979)) ([ad0aa8e](https://github.com/logto-io/logto/commit/ad0aa8e0c20a8d60f095b477e942b724fb53ca7d))
- **shared,phrases-ui:** not allow hyphens in username ([#1319](https://github.com/logto-io/logto/issues/1319)) ([5e81966](https://github.com/logto-io/logto/commit/5e819665c7c1d584ff5cff25e4e0723122be78b2))
- update field check rules ([#854](https://github.com/logto-io/logto/issues/854)) ([85a407c](https://github.com/logto-io/logto/commit/85a407c5f6f76fed0513acd6fb41943413935b5a))

### Bug Fixes

- `lint:report` script ([#730](https://github.com/logto-io/logto/issues/730)) ([3b17324](https://github.com/logto-io/logto/commit/3b17324d189b2fe47985d0bee8b37b4ef1dbdd2b))
- **console:** dashboard chart style ([#1177](https://github.com/logto-io/logto/issues/1177)) ([cf47044](https://github.com/logto-io/logto/commit/cf470446e4458e748bbf6384adb96d69805a1991)), closes [#1178](https://github.com/logto-io/logto/issues/1178)
- **console:** new platform tab colors ([#1158](https://github.com/logto-io/logto/issues/1158)) ([1bb770f](https://github.com/logto-io/logto/commit/1bb770fd1fa364f12c1c56a8542d36a3cf9647fe))
- **core:** remove name regex ([#1109](https://github.com/logto-io/logto/issues/1109)) ([a790248](https://github.com/logto-io/logto/commit/a790248c091e444614652b08b05686e9934cb639))
