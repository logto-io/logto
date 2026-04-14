---
"@logto/experience": patch
---

fix: add localStorage fallback for social/SSO redirect state in in-app browsers

Some in-app browsers (e.g., Instagram, Facebook, LINE) open OAuth IdP pages in a new WebView, causing sessionStorage to be lost when redirecting back. This change adds a localStorage-based fallback mechanism:

- Before redirecting to the IdP, store the redirect context (state, verificationId, connectorId) in both sessionStorage and localStorage
- On callback, if sessionStorage state is missing, attempt to restore from localStorage
- localStorage entries are consumed on read and auto-swept after 10 minutes
- If both storages are empty, show an error toast to the user
