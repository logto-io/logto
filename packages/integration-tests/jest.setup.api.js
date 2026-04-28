import { createRequire } from 'node:module';

import { authedAdminTenantApi } from './lib/api/api.js';

// A patch for the global require function - see https://github.com/evanw/esbuild/issues/1921
// eslint-disable-next-line @silverhand/fp/no-mutation
globalThis.require = createRequire(import.meta.url);

// Reset the sign-in experience settings to default before each test suite, to avoid unexpected
// side effects from other test suites. Add more configurations here if needed.
await authedAdminTenantApi.patch('sign-in-exp', {
  json: { signInMode: 'SignInAndRegister', sentinelPolicy: {} },
});
