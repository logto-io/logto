set -eo pipefail

echo Building packages
pnpm -- lerna run build --stream

echo Prune dependencies
rm -rf node_modules packages/*/node_modules

echo Install production dependencies
NODE_ENV=production pnpm i

echo Prune files
rm -rf \
.git .github .husky .vscode .parcel-cache pnpm-*.yaml *.js \
packages/*/src \
packages/*/*.config.js packages/*/*.config.ts packages/*/tsconfig*.json

echo Tar
cd ..
tar -czf /tmp/logto.tar.gz logto
