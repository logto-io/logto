---
"@logto/core": patch
"@logto/phrases": patch
---

fix OIDC scope error messages showing a raw placeholder instead of the rejected scope

The `invalid_scope` and `insufficient_scope` messages rendered the literal `{{error_description}}` and `{{scope}}` text because the error handler never passed the values in. They now name the scope that was rejected, so an end user who hits a stale scope on the consent page no longer sees a placeholder in the error toast.
