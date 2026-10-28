---
"@logto/tunnel": patch
---

prevent symlinks in the experience path from serving files outside of it

The tunnel service now resolves symlinks before serving static files from `--experience-path`. Requests for files whose real location is outside the experience path return 404, while symlinks that point to files inside it and an experience path that is itself a symlink keep working.
