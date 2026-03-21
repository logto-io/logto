#!/usr/bin/env bash
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

# Remove files that are not needed for production
# Some node packages use `src` as their dist folder, so ignore them from the rm list in the end
find . \
  \( -path './node_modules' -o -path '*/node_modules/*' \) -prune -o \
  \( \
    -path './.git' -o \
    -path './.changeset' -o \
    -path './.devcontainer' -o \
    -path './.github' -o \
    -path './.husky' -o \
    -path './.scripts' -o \
    -path './.vscode' -o \
    -path './packages/*/src' -o \
    -path './packages/*/*.config.js' -o \
    -path './packages/*/*.config.ts' -o \
    -path './packages/*/tsconfig*.json' -o \
    -name 'pnpm-*.yaml' -o \
    \( -mindepth 1 -maxdepth 1 -name '*.js' -a -type f \) \
  \) \
  -exec rm -rf {} +

# Add official connectors
cloud_option=$( [[ "$IS_CLOUD" =~ ^(1|true|y|yes|yep|yeah)$ ]] && echo "--cloud" || echo "" )
pnpm cli connector link $cloud_option -p .

if [[ "${SKIP_TAR:-}" == @(1|true|y|yes|yep|yeah) ]]; then
  echo "Skipping tar creation"
  exit 0
fi

echo Tar the package
cd ..
tar -czf /tmp/logto.tar.gz logto
