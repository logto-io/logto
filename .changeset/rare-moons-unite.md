---
"@logto/experience": patch
---

fix(experience): prevent errors from applying unsupported cached identifier types

Previously, cached identifier input values were applied to all pages without type checking, potentially causing errors. Now, the type is verified before application to ensure compatibility with each page's supported types.
