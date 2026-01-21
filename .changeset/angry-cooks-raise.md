---
"@logto/experience": patch
---

fix: prevent repeated auto sign-in requests on direct sign-in page

In certain scenarios, the direct sign-in page may trigger repeated auto sign-in attempts due to re-renders, resulting in unexpected behavior.

For example, an extra social authentication request can be triggered when a user clicks the Terms of Service link on a social direct sign-in page with manual Terms of Service enforcement enabled. This can cause social authentication to fail.

This update ensures that the auto sign-in logic runs only once when the component mounts, preventing multiple redirects and improving the overall user experience.
