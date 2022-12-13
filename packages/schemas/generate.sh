#!/bin/sh

rm -rf lib/
pnpm exec tsc -p tsconfig.build.gen.json
rm -rf src/db-entries
node lib/index.js
pnpm exec eslint src/db-entries/** --fix
