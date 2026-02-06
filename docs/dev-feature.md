# Dev Feature

This document describes how to work with dev features in Logto.

## What is a Dev Feature?

Dev features are experimental features that are not yet ready for production. They are controlled by the `isDevFeaturesEnabled` flag.

## Usage in Code

### Core Package

Import from `EnvSet`:

```typescript
import { EnvSet } from '#src/env-set/index.js';

// DEV: <feature description>
if (EnvSet.values.isDevFeaturesEnabled) {
  router.get(
    '/your-route',
    koaGuard({ /* ... */ }),
    async (ctx, next) => {
      // Implementation
    }
  );
}
```

### Console Package

Import from `@/consts/env`:

```typescript
import { isDevFeaturesEnabled } from '@/consts/env';

// DEV: <feature description>
{isDevFeaturesEnabled && <YourDevFeatureComponent />}
```

The flag is determined by (from `packages/console/src/consts/env.ts`):

```typescript
export const isDevFeaturesEnabled =
  !isProduction ||
  yes(normalizeEnv(import.meta.env.DEV_FEATURES_ENABLED)) ||
  yes(localStorage.getItem(storageKeys.isDevFeaturesEnabled));
```

- `!isProduction` - Always enabled in non-production builds
- `import.meta.env.DEV_FEATURES_ENABLED` - Environment variable
- `localStorage.getItem(storageKeys.isDevFeaturesEnabled)` - Can be enabled via localStorage for testing

### Comment Convention

Use consistent comments to mark dev features for easy search and cleanup during release:

```typescript
// DEV: <feature description>
```

This makes it easy to find all dev feature code when graduating features to production.

## Usage in Integration Tests

The integration tests run twice: once with `isDevFeaturesEnabled=true` and once with `isDevFeaturesEnabled=false`.

Import test utilities from `packages/integration-tests/src/utils.ts`:

```typescript
import { devFeatureTest, devFeatureDisabledTest } from '#src/utils.js';
```

### `devFeatureTest`

Use when tests should **only run when dev features are enabled**:

```typescript
devFeatureTest.describe('My dev feature', () => {
  devFeatureTest.it('should work when dev features enabled', async () => {
    // This test only runs when isDevFeaturesEnabled=true
  });
});
```

### `devFeatureDisabledTest`

Use when tests should **only run when dev features are disabled**:

```typescript
devFeatureDisabledTest.describe('My feature disabled behavior', () => {
  devFeatureDisabledTest.it('should not expose route when dev features disabled', async () => {
    // This test only runs when isDevFeaturesEnabled=false
  });
});
```

### Implementation Details

```typescript
// From packages/integration-tests/src/utils.ts
export const devFeatureTest = Object.freeze({
  it: isDevFeaturesEnabled ? it : it.skip,
  describe: isDevFeaturesEnabled ? describe : describe.skip,
});

export const devFeatureDisabledTest = Object.freeze({
  it: isDevFeaturesEnabled ? it.skip : it,
  describe: isDevFeaturesEnabled ? describe.skip : describe,
});
```

## Usage in OpenAPI Documentation

When adding OpenAPI documentation for dev feature routes, include the `"Dev feature"` tag. This ensures the routes are automatically removed from the OpenAPI spec when `isDevFeaturesEnabled=false`.

```json
"/api/your-route": {
  "get": {
    "tags": ["Dev feature"],
    "summary": "Your route summary",
    "description": "Your route description.",
    "responses": {
      "200": {
        "description": "Success response."
      }
    }
  }
}
```

The `removeUnnecessaryOperations` function in `packages/core/src/routes/swagger/utils/general.ts` will automatically filter out operations tagged with `"Dev feature"` when the flag is disabled.

## Usage in Custom Route Operation IDs

If your dev feature route needs a custom operation ID, add it to `devFeatureCustomRoutes` in `packages/core/src/routes/swagger/utils/operation-id.ts`:

```typescript
const devFeatureCustomRoutes: RouteDictionary = Object.freeze({
  // DEV: <feature description>
  'get /your-route': 'GetYourRoute',
  'patch /your-route': 'UpdateYourRoute',
});
```

## Graduating a Dev Feature

When a dev feature is ready for production:

1. Remove `isDevFeaturesEnabled` condition from route registration
2. Move entries from `devFeatureCustomRoutes` to `customRoutes`
3. Remove `"tags": ["Dev feature"]` from openapi.json
4. Remove `// DEV: <feature description>` comments
5. Update tests from `devFeatureTest` to regular `it`/`describe`
