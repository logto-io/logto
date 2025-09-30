---
"@logto/experience": patch
---

fix an issue that prevents Logto Experience from working in Android 11 and some older browser versions

The issue is introduced in version 1.32.0 by the usage of the `||=` operator, which is not supported in some older browsers (#7857).
