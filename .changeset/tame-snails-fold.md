---
"@logto/language-kit": patch
"@logto/translate": patch
---

make method `isLanguageTag` case-insensitive

The language tags should be case insensitive. In `phrases` and `phrases-experience` packages, the language tags are all in lowercase. However, in the language kit, the language tags are in mixed cases, such as `pt-BR` and `zh-CN`.

Therefore, some of the i18n phrases were not translated by the translate CLI tool. The fix is to update the language kit to ignore cases in `isLanguageTag` function, so that the previously mismatched language tags can be detected and translated.
