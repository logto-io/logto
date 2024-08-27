set -eo pipefail

# Enable globstar (**) feature
shopt -s globstar

echo Prune dependencies
rm -rf node_modules packages/**/node_modules

echo Install production dependencies
NODE_ENV=production pnpm i

echo Prune files

if [[ "${IS_CLOUD}" != @(1|true|y|yes|yep|yeah) ]]; then
  # Remove cloud in OSS distributions
  rm -rf packages/cloud
fi

# Some node packages use `src` as their dist folder, so ignore them from the rm list in the end
find \
.git .changeset .devcontainer .github .husky .scripts .vscode pnpm-*.yaml *.js \
packages/**/src \
packages/**/*.config.js packages/**/*.config.ts packages/**/tsconfig*.json \
! -path '**/node_modules/**' \
-prune -exec rm -rf {} +

# Add official connectors
cloud_option=$( [[ "$IS_CLOUD" =~ ^(1|true|y|yes|yep|yeah)$ ]] && echo "--cloud" || echo "" )
pnpm cli connector link $cloud_option -p .

echo Tar
cd ..
tar -czf /tmp/logto.tar.gz logto
