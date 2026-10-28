import { createRequire } from 'node:module';

import { authedAdminTenantApi } from './lib/api/api.js';
import { resetSignInExperience } from './lib/helpers/sign-in-experience.js';

// A patch for the global require function - see https://github.com/evanw/esbuild/issues/1921
// eslint-disable-next-line @silverhand/fp/no-mutation
globalThis.require = createRequire(import.meta.url);

// Keep the admin tenant open for registration, which Logto closes once the first admin user is
// provisioned, and restore its default sentinel thresholds.
await authedAdminTenantApi.patch('sign-in-exp', {
  json: { signInMode: 'SignInAndRegister', sentinelPolicy: {} },
});

// Reset the tenant's sign-in experience before each test suite, so a suite that leaves it changed
// cannot decide whether the next one passes. When a suite starts leaving a new setting changed, add
// that setting to `defaultSignInExperienceSettings`.
await resetSignInExperience();
