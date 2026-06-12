---
"@logto/connector-kit": patch
---

fix a runtime crash on iOS 15 and older Safari when loading the experience or demo apps

`urlRegEx` used a lookbehind assertion (`(?<![\w.])`), which Safari < 16.4 cannot parse. Because the regex is a top-level literal bundled into the experience app, loading the app threw `SyntaxError: Invalid regular expression: invalid group specifier name` before any code ran. The boundary now uses a `(?:^|[^\w.])` group, which is behaviorally equivalent for `.test()` and parses on all supported browsers.
