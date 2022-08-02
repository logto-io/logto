set -eo pipefail

echo Link the mock connectors for integration tests only
cd packages/core
pnpm link @logto/connector-mock-sms
pnpm link @logto/connector-mock-email
pnpm link @logto/connector-mock-social
cd -

echo Update the pnpm-lock.json
pnpm i --no-frozen-lockfile --lockfile-only
