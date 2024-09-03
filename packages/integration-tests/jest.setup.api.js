import { createRequire } from 'node:module';

import { authedAdminTenantApi } from './lib/api/api.js';

// A patch for the global require function - see https://github.com/evanw/esbuild/issues/1921
// eslint-disable-next-line @silverhand/fp/no-mutation
globalThis.require = createRequire(import.meta.url);

// We need to update this before tests otherwise Logto will update SignInMode for admin tenant
// The update logic should be
await authedAdminTenantApi.patch('sign-in-exp', {
  json: { signInMode: 'SignInAndRegister' },
});
