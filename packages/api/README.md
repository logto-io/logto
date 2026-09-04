# @logto/api

A TypeScript SDK for interacting with Logto's Management API using client credentials authentication.

## Installation

```bash
npm install @logto/api
```

## Quick start

### Prerequisites

Before using this SDK, you need to:

1. Create a machine-to-machine application in your Logto Console
2. Grant the application access to the Management API
3. Note down the client ID and client secret

For detailed setup instructions, visit: https://a.logto.io/m2m-mapi

### Basic usage

#### Logto Cloud

```ts
import { createManagementApi } from '@logto/api/management';

// For Logto Cloud
const { apiClient } = createManagementApi('your-tenant-id', {
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
});

// Make API calls
const response = await apiClient.get('/api/users');
console.log(response.data);
```

#### Self-hosted / OSS

```ts
import { createManagementApi } from '@logto/api/management';

const { apiClient } = createManagementApi('default', {
  clientId: 'your-client-id',
  clientSecret: 'your-client-secret',
  baseUrl: 'https://your-logto-instance.com',
  apiIndicator: 'https://your-logto-instance.com/api',
  requestTimeout: 10,
});
```

`createManagementApi` caches access tokens and shares one token fetch across concurrent requests.
Token requests reject redirects and time out after 10 seconds by default. Use `tokenRequestTimeout`
to configure the timeout in seconds. Set it to `0`, a negative value, or `Infinity` to disable the
timeout. `NaN` falls back to the 10-second default. If an API request returns `401`, the client
invalidates the matching cached token so the next request fetches a new one. It waits for that
replacement token to receive a successful API response before allowing another invalidation,
avoiding repeated token fetches for permanent `401` responses. The failed API request is returned to
the caller without an automatic retry.

API clients expose lowercase HTTP methods such as `.get()`, `.post()`, and `.delete()`. The existing
uppercase methods remain available for compatibility.

Management API requests time out after 10 seconds by default. Use `requestTimeout` to configure a
client-wide timeout in seconds. Set it to `0`, a negative value, or `Infinity` to disable it. `NaN`
falls back to the 10-second default. A per-request `signal` can still cancel an individual request
earlier.

#### Custom authentication

For advanced use cases where you need full control over the authentication logic, use `createApiClient`:

```ts
import { createApiClient } from '@logto/api/management';

const client = createApiClient({
  baseUrl: 'https://your-logto-instance.com',
  getToken: async () => {
    // Your custom token retrieval logic
    return getYourToken();
  },
});

// Type-safe API calls
const response = await client.get('/api/applications/{id}', {
  params: { path: { id: 'your-app-id' } },
});
```

### API documentation

For detailed API documentation, refer to the [Logto Management API documentation](https://openapi.logto.io/).

## Development

To avoid unnecessary build time in CI, full type generation only happens before publishing. The `build` script will generate mock types if no types are found.

To explicitly generate types, run:

```bash
pnpm generate-types
```

This will start a local Docker Compose environment, generate types by fetching the OpenAPI endpoints, and then shut down the environment.
