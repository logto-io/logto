---
"@logto/tunnel": patch
---

support range request for mp4 video source hosting

Safari browser uses range request to fetch video data, but it was not supported by the `@logto/tunnel` CLI tool. This prevents our users who want to build custom sign-in pages with video background. In order to fix this, we need to partially read the video file stream based on the `range` request header, and set proper response headers and status code (206).
