# API Development Checklist

When developing new API routes in Logto core, follow this checklist to ensure everything is properly configured.

## 1. Route Definition

Define your route in `packages/core/src/routes/`.

```typescript
router.get(
  '/configs/your-route',
  koaGuard({
    response: yourGuard,
    status: [200],
  }),
  async (ctx, next) => {
    ctx.body = await yourService.getData();
    return next();
  }
);
```

> For dev features, see [Dev Feature](./dev-feature.md) documentation.

## 2. Custom Operation ID

If your route path doesn't follow the standard pattern `[name, :parameter]`, you need to add a custom operation ID.

### When is it needed?

The OpenAPI generator expects paths like:
- `/resources/:resourceId` - ✅ Works automatically
- `/resources/:resourceId/scopes/:scopeId` - ✅ Works automatically
- `/configs/admin-console` - ❌ Needs custom operation ID
- `/configs/jwt-customizer/test` - ❌ Needs custom operation ID

### How to add

Edit `packages/core/src/routes/swagger/utils/operation-id.ts`:

```typescript
export const customRoutes: Readonly<RouteDictionary> = Object.freeze({
  // ... existing routes
  // Configs
  'get /configs/your-route': 'GetYourRouteConfig',
  'patch /configs/your-route': 'UpdateYourRouteConfig',
  // ...
});
```

## 3. OpenAPI Documentation

Add API documentation to the appropriate `.openapi.json` file.

### Find the right file

- Config routes → `packages/core/src/routes/logto-config/logto-config.openapi.json`
- User routes → `packages/core/src/routes/admin-user/*.openapi.json`
- Application routes → `packages/core/src/routes/applications/*.openapi.json`
- etc.

### Add documentation

```json
"/api/configs/your-route": {
  "get": {
    "summary": "Get your route config",
    "description": "Get the configuration for your feature.",
    "responses": {
      "200": {
        "description": "The configuration object."
      }
    }
  },
  "patch": {
    "summary": "Update your route config",
    "description": "Update the configuration for your feature.",
    "requestBody": {
      "content": {
        "application/json": {
          "schema": {
            "properties": {
              "yourProperty": {
                "description": "Description of the property."
              }
            }
          }
        }
      }
    },
    "responses": {
      "200": {
        "description": "The updated configuration object."
      }
    }
  }
}
```

### Required fields

Every operation must have:
- `summary` - Short description
- `description` - Detailed description
- `responses` - At least one response

## 4. Validation

### Build check

```bash
pnpm -F @logto/core build
```

### Integration tests

Integration tests validate:
- Swagger JSON generation (`swagger-check.test.js`)
- OpenAPI JSON endpoints (`well-known.openapi.test.js`)

## Common Errors and Solutions

### "Invalid path for generating operation ID: get /your/path"

**Cause**: Route path doesn't match the expected pattern `[name, :parameter]`

**Solution**: Add custom operation ID to `customRoutes` in `operation-id.ts`

### "Path `/api/your/path` and operation `get` must have a summary"

**Cause**: Missing openapi.json documentation for the route

**Solution**: Add the route to the appropriate `.openapi.json` file with `summary` and `description`

### "Supplement document contains extra path: `/api/your/path`"

**Cause**: openapi.json has path definition but route doesn't exist (common with dev features when `isDevFeaturesEnabled=false`)

**Solution**: Add `"tags": ["Dev feature"]` to the operations in openapi.json (see [Dev Feature](./dev-feature.md))

### "Not all custom routes are built" / "There are extra routes that are built but not defined"

**Cause**: Mismatch between `customRoutes` entries and actual routes

**Solution**: Ensure every entry in `customRoutes` has a corresponding route, and vice versa

## Files Reference

| Purpose | Location |
|---------|----------|
| Route definitions | `packages/core/src/routes/` |
| Custom operation IDs | `packages/core/src/routes/swagger/utils/operation-id.ts` |
| OpenAPI supplements | `packages/core/src/routes/**/*.openapi.json` |
| Swagger validation | `packages/core/src/routes/swagger/utils/general.ts` |
