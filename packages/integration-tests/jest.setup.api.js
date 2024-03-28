import { authedAdminTenantApi } from './lib/api/api.js';

// We need to update this before tests otherwise Logto will update SignInMode for admin tenant
// The update logic should be
await authedAdminTenantApi.patch('sign-in-exp', {
  json: { signInMode: 'SignInAndRegister' },
});

const waitFor = async (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

global.afterEach(async () => {
  // Try to mitigate the issue of "Socket hang up". See https://github.com/nodejs/node/issues/47130
  await waitFor(1);
});
