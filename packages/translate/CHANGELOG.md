# @logto/translate

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
