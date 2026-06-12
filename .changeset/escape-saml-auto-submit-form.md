---
"@logto/core": patch
---

escape HTML attribute values in the SAML IdP auto-submit form

When Logto acts as a SAML IdP, the auto-submit form posted to the SP's ACS interpolated `SAMLResponse`, `RelayState` and the action URL into HTML attributes without escaping. If a value contained a double quote, the browser truncated the attribute at that quote.

This broke SPs that send a JSON string as `RelayState`: the SP received only `{` instead of the full value, losing the post-login context. The values are now HTML-escaped, so quotes and other markup characters round-trip intact (this also closes a reflected-markup injection vector in the interstitial page).

In addition, the form action URL is now restricted to the `http`/`https` schemes before rendering. Escaping the attribute value alone does not neutralize a scriptable scheme such as `javascript:`, which the browser would execute on submission, so such URLs are now rejected.
