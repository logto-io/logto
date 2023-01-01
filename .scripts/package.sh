set -eo pipefail

# Enable globstar (**) feature
shopt -s globstar

echo Prune dependencies
rm -rf node_modules packages/**/node_modules

echo Install production dependencies
NODE_ENV=production pnpm i

echo Prune files
# Some node packages use `src` as their dist folder, so ignore them from the rm list in the end
find \
.git .changeset .changeset-staged .devcontainer .github .husky .parcel-cache .scripts .vscode pnpm-*.yaml *.js \
packages/**/src \
packages/**/*.config.js packages/**/*.config.ts packages/**/tsconfig*.json \
! -path '**/node_modules/**' \
-prune -exec rm -rf {} +

# Add official connectors
pnpm cli connector add --official -p .

echo Tar
cd ..
tar -czf /tmp/logto.tar.gz logto
