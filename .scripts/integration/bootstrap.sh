#!/usr/bin/env bash
set -euo pipefail

# This script is used to set up Logto in Docker Compose and start the services for the integration
# tests.

cd /etc/logto

npm run cli db seed -- --test --swe
npm run cli connector list -- -p . | grep OFFICIAL
npm run cli connector link -- --mock -p .
npm run cli db system set cloudflareHostnameProvider '{"zoneId":"mock-zone-id","apiToken":""}'

cd packages/core

if [[ "${COVERAGE:-0}" == "1" ]]; then
  echo "[bootstrap] building instrumented code for coverage collection"
  npm run build:instrument

  echo "[bootstrap] starting services with nyc"
  exec nyc \
    --temp-dir "${COVERAGE_TEMP_DIR:-./coverage/raw}" \
    --report-dir "${COVERAGE_REPORT_DIR:-./coverage/report}" \
    --reporter=text-summary \
    --reporter=lcov \
    --no-instrument \
    --exclude="**/__mocks__/**" \
    --exclude-after-remap \
    npm run start
else
  echo "[bootstrap] starting services"
  exec npm start
fi
