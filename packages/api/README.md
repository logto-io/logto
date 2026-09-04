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

// Make API calls with lowercase or uppercase methods
const response = await apiClient.get('/api/users');
// const response = await apiClient.GET('/api/users');
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
});
```

#### Timeouts

Token fetches and Management API network requests have separate 10-second timeouts. The API request
timeout starts after token retrieval, so a request that needs a new token can use both timeout
periods. Use `tokenRequestTimeout` and `requestTimeout` to configure them in seconds. Set either option
to `0` or a negative value to disable its timeout.

Use `getTokenRequestSignal` to return a custom signal for each token request. The signal is composed
with `tokenRequestTimeout`, and the first one to abort cancels the token request. A per-request
`signal` is similarly composed with `requestTimeout` for the Management API request. Timeouts and
custom cancellation reject the API call instead of returning a response object.

#### Token refresh

After a Management API request returns `401`, the next request fetches a new token. If the replacement
token also receives a `401`, it remains cached until a request succeeds or the token expires. The SDK
does not automatically retry the failed API request.

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
