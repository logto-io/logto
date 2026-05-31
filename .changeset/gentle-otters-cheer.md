---
"@logto/core": patch
---

fix a flash of built-in styles on the hosted sign-in experience when custom CSS is configured

Custom CSS was injected on the client via react-helmet, which mutates `<head>` asynchronously after the page had already painted with the built-in styles. The server-rendered experience HTML now inlines the configured custom CSS into `<head>`, so it is part of the cascade on the first paint. The `</style>` sequence in custom CSS is escaped so it cannot terminate the style element early, and the SSR data embedded in the inline `<script>` is now serialized with HTML-significant characters escaped to prevent script breakout.
