---
"@logto/experience": minor
"@logto/core": minor
---

support direct sign-in

Instead of showing a screen for the user to choose between the sign-in methods, a specific sign-in method can be initiated directly by setting the `direct_sign_in` parameter in the OIDC authentication request.

This parameter follows the format of `direct_sign_in=<method>:<target>`, where:

- `<method>` is the sign-in method to trigger. Currently the only supported value is `social`.
- `<target>` is the target value for the sign-in method. If the method is `social`, the value is the social connector's `target`.

When a valid `direct_sign_in` parameter is set, the first screen will be skipped and the specified sign-in method will be triggered immediately upon entering the sign-in experience. If the parameter is invalid, the default behavior of showing the first screen will be used.
