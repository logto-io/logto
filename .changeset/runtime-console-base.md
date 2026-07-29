---
"@logto/core": patch
---

support a runtime Admin Console base path

The console's asset base is baked in at build time via `CONSOLE_PUBLIC_URL` (Vite `base`), so a prebuilt image cannot be served under a different sub-path without a rebuild. When built with `--build-arg console_runtime_base=true`, the console is built with a sentinel base that the container entrypoint rewrites to the runtime `CONSOLE_PUBLIC_URL` (default `/console`) at startup. Default builds are unaffected and the entrypoint is a no-op for them. This covers the asset base only; serving the console under a non-default path also requires core's mount path to match, which is out of scope here.
