---
"@logto/core": patch
---

respond 404 for non-existing paths in `/assets`

Our single-page application proxy now responds with a 404 for non-existing paths in `/assets` instead of falling back to the `index.html` file.

This prevents the browser and CDN from caching the `index.html` file for non-existing paths in `/assets`, which can lead to confusion and unexpected behavior.
Since the `/assets` path is used only for static assets, it is safe and improves the user experience. 
