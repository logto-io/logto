#!/bin/sh

# Clean up
rm -rf scripts-js/
# build the jwt-customizer-type-definition generate script
pnpm exec tsc -p tsconfig.scripts.gen.json
# clean up the existing generated jwt-customizer-type-definition file
rm -f src/consts/jwt-customizer-type-definition.ts
# run script
node scripts-js/generate-jwt-customizer-type-definition.js
# Clean up
rm -rf scripts-js/
