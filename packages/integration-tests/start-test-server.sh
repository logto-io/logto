#!/bin/bash

# Check for --skip-build argument
SKIP_BUILD=false
for arg in "$@"; do
  if [ "$arg" = "--skip-build" ]; then
    SKIP_BUILD=true
    break
  fi
done

lsof -ti:3001,3002,3003 | xargs kill -9 2>/dev/null || true

cd /Users/markwylde/Documents/Projects/logto/packages/integration-tests
./reset-test-db.sh

cd /Users/markwylde/Documents/Projects/logto
pnpm cli connector link --mock -p .

pnpm cli connector add @logto/connector-mock-social @logto/connector-mock-email @logto/connector-mock-sms -p .

DB_URL="postgres://postgres:p0stgr3s@localhost:5432/logto_test" pnpm cli db system set cloudflareHostnameProvider '{"zoneId":"mock-zone-id","apiToken":""}'

export NODE_ENV=production DB_URL="postgres://postgres:p0stgr3s@localhost:5432/logto_test" INTEGRATION_TEST=1 DEV_FEATURES_ENABLED=false SECRET_VAULT_KEK=DtPWS09unRXGuRScB60qXqCSsrjd22dUlXt/0oZgxSo=

if [ "$SKIP_BUILD" = false ]; then
  echo "🔨 Building project..."
  pnpm -r build
else
  echo "⏭️ Skipping build step"
fi

pnpm start
