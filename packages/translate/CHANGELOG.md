# @logto/translate

## 0.2.7

### Patch Changes

- Updated dependencies [a6858e76cf]
- Updated dependencies [116dcf5e7d]
- Updated dependencies [d551f5ccc3]
- Updated dependencies [116dcf5e7d]
  - @logto/phrases@1.24.0

## 0.2.6

### Patch Changes

- Updated dependencies [c3266a917a]
  - @logto/phrases@1.23.0

## 0.2.5

### Patch Changes

- Updated dependencies [47dbdd8332]
  - @logto/phrases@1.22.0

## 0.2.4

### Patch Changes

- Updated dependencies [147f257503]
- Updated dependencies [1fb8593659]
- Updated dependencies [0ef4260e34]
  - @logto/phrases-experience@1.12.0
  - @logto/phrases@1.21.0

## 0.2.3

### Patch Changes

- Updated dependencies [8ae82d585e]
  - @logto/phrases-experience@1.11.0
  - @logto/phrases@1.20.0

## 0.2.2

### Patch Changes

- Updated dependencies [4cc321dbb]
  - @logto/core-kit@2.6.1
  - @logto/phrases-experience@1.10.1

## 0.2.1

### Patch Changes

- 7ac250990: allow empty file when syncing keys

  The previous behavior was to throw an error if any of the `import` files was empty. This caused issues when we needed to remove files and resync keys, as it would lead to manual intervention to delete the `import` clauses.

  With this change, missing or empty `import` files are treated as empty by default, allowing the sync process to continue without errors.

- 7ac250990: use `gpt-4.1` as the default model

  As it's newer and cheaper than `gpt-4o-2024-08-06`.

- Updated dependencies [35bbc4399]
  - @logto/shared@3.3.0

## 0.2.0

### Minor Changes

- 2961d355d: bump node version to ^22.14.0

### Patch Changes

- 23b6fe588: should correctly read modal name from env
- Updated dependencies [2961d355d]
- Updated dependencies [0a76f3389]
- Updated dependencies [e69ea0373]
  - @logto/language-kit@1.2.0
  - @logto/phrases-experience@1.10.0
  - @logto/core-kit@2.6.0
  - @logto/phrases@1.19.0
  - @logto/shared@3.2.0

## 0.1.3

### Patch Changes

- 552a36848: improve openai prompt to better support i18n plural form suffixes
- 5da01bc47: make method `isLanguageTag` case-insensitive

  The language tags should be case insensitive. In `phrases` and `phrases-experience` packages, the language tags are all in lowercase. However, in the language kit, the language tags are in mixed cases, such as `pt-BR` and `zh-CN`.

  Therefore, some of the i18n phrases were not translated by the translate CLI tool. The fix is to update the language kit to ignore cases in `isLanguageTag` function, so that the previously mismatched language tags can be detected and translated.

- Updated dependencies [5da01bc47]
  - @logto/language-kit@1.1.3

## 0.1.2

### Patch Changes

- 59f6b8eda: update translate CLI for better language and package compatibility
- Updated dependencies [59f6b8eda]
  - @logto/language-kit@1.1.2

## 0.1.1

### Patch Changes

- e11e57de8: bump dependencies for security update
- Updated dependencies [0b785ee0d]
- Updated dependencies [5086f4bd2]
- Updated dependencies [e11e57de8]
  - @logto/phrases@1.18.0
  - @logto/language-kit@1.1.1
  - @logto/core-kit@2.5.4
  - @logto/shared@3.1.4
  - @logto/phrases-experience@1.9.1

## 0.1.0

### Minor Changes

- 0183d0c33: split translate command from @logto/cli and create a standalone package

  The "translate" command has greatly increased the size of the "@logto/cli" package, as it involves TypeScript code manipulation and has to use "typescrpt" as a "dependency".
  In fact, only a small number of developers who want to contribute Logto will use this command, so we believe it's best to separate the less frequently used "translate" command from the "cli" package to keep it small and simple.

  Please also be noted that this change is actually a breaking change for those who use the "translate" command. However, the CLI has to be bundle-released with the "Logto" open-source distribution, and we feel it is still too early to make a major version bump for Logto. Therefore, the "minor" bump is used this time.

### Patch Changes

- Updated dependencies [f150a67d5]
- Updated dependencies [e0326c96c]
- Updated dependencies [53060c203]
  - @logto/phrases@1.14.0
  - @logto/phrases-experience@1.8.0
