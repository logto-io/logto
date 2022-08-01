set -eo pipefail

echo Building packages
pnpm -- lerna run build --stream

echo Prune dependencies
rm -rf node_modules packages/*/node_modules

echo Install production dependencies
if [[ $INTEGRATION_TEST =~ ^(true|1)$ ]]; then
  echo Install the mock connectors for integration tests only
  cd packages/core
  pnpm link @logto/connector-mock-sms
  pnpm link @logto/connector-mock-email
  pnpm link @logto/connector-mock-social
  cd -
  NODE_ENV=production pnpm i --no-frozen-lockfile
else
  NODE_ENV=production pnpm i
fi

echo Prune files
rm -rf \
.git .github .husky .vscode .parcel-cache pnpm-*.yaml *.js \
packages/*/src \
packages/*/*.config.js packages/*/*.config.ts packages/*/tsconfig*.json

echo Tar
cd ..
tar -czf /tmp/logto.tar.gz logto
