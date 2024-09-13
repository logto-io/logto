# @logto/translate

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
