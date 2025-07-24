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
const response = await apiClient.GET('/api/users');
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

### API documentation

For detailed API documentation, refer to the [Logto Management API documentation](https://openapi.logto.io/).

## Development

To avoid unnecessary build time in CI, full type generation only happens before publishing. The `build` script will generate mock types if no types are found.

To explicitly generate types, run:

```bash
pnpm generate-types
```

This will start a local Docker Compose environment, generate types by fetching the OpenAPI endpoints, and then shut down the environment.
