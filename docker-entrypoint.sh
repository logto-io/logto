#!/bin/sh
# Logto container entrypoint.
#
# Runtime Admin Console base path. The console is a Vite SPA whose asset base is
# baked in at build time (`CONSOLE_PUBLIC_URL` -> Vite `base`), which prevents a
# single prebuilt image from being served under different sub-paths (a real
# constraint when the image is produced by a third party, e.g. a hardened-image
# supplier, and only consumed downstream).
#
# When the image is built with `--build-arg console_runtime_base=true`, the
# console is built with a sentinel base instead. This entrypoint rewrites that
# sentinel to the runtime `CONSOLE_PUBLIC_URL` (default `/console`) before the
# server starts, so one image works under any base path. Default images are not
# built with the sentinel, so this is a no-op for them.
set -e

sentinel="/__LOGTO_CONSOLE_BASE__"
console_dist="node_modules/@logto/console/dist"
runtime_base="${CONSOLE_PUBLIC_URL:-/console}"
# Vite's sentinel base carries no trailing slash; normalise the runtime value to match.
runtime_base="${runtime_base%/}"

if [ -d "$console_dist" ] && grep -rlq "$sentinel" "$console_dist" 2>/dev/null; then
  echo "[entrypoint] Setting Admin Console base path: ${runtime_base}"
  # The base only appears in the emitted text assets (JS/CSS/HTML), including the
  # `import.meta.env.BASE_URL` string the router basename derives from.
  find "$console_dist" -type f \( -name '*.js' -o -name '*.css' -o -name '*.html' \) \
    -exec sed -i "s#${sentinel}#${runtime_base}#g" {} +
  # koa-send serves pre-compressed .br/.gz variants when present, and sed cannot
  # edit those, so they would still carry the sentinel. Drop them so the rewritten
  # uncompressed assets are served instead. (Re-compressing after the rewrite would
  # preserve on-the-wire size but needs brotli/gzip in the image; left as a follow-up.)
  find "$console_dist" -type f \( -name '*.br' -o -name '*.gz' \) -delete
fi

exec npm run "$@"
