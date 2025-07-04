if [ ! -f src/generated-types/management.ts ]; then
  echo "WARNING: Type files not found. Mocking types to avoid build errors."
  mkdir -p src/generated-types
  echo "export interface paths {}" > src/generated-types/management.ts
fi
