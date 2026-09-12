---
"@logto/experience": patch
---

opt the sign-in experience out of browser auto-translation

Browser auto-translation replaces the text nodes React created (`<font><font>…</font></font>`). React's DOM bookkeeping no longer matches the document, so the next update throws `NotFoundError: Failed to execute 'removeChild' on 'Node'`; the experience app has no error boundary, so the whole tree unmounts and the user is left on a blank page in the middle of signing in or signing up — a reload is the only way out.

The experience is already localized per tenant (custom phrases plus language detection), so the page now ships `translate="no"` and `<meta name="google" content="notranslate">`, which is what Chrome, Edge and Safari read before offering or applying a translation.
