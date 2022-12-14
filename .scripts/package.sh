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
.git .github .husky .vscode .parcel-cache pnpm-*.yaml *.js \
packages/**/src \
packages/**/*.config.js packages/**/*.config.ts packages/**/tsconfig*.json \
! -path '**/node_modules/**' \
-prune -exec rm -rf {} +

echo Tar
cd ..
tar -czf /tmp/logto.tar.gz logto
