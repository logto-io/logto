---
"@logto/phrases": patch
"@logto/core": patch
---

fix an issue that prevent mp4 video from playing in custom sign-in pages on Safari browser

Safari browser uses range request to fetch video data, but it was not supported by the `koa-serve-custom-ui-assets` middleware in core. This prevents our users who want to build custom sign-in pages with video background. In order to fix this, we need to partially read the video file stream based on the `range` request header, and set proper response headers and status code (206).
