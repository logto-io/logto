import { authedAdminTenantApi } from './lib/api/api.js';

// We need to update this before tests otherwise Logto will update SignInMode for admin tenant
// The update logic should be
await authedAdminTenantApi.patch('sign-in-exp', {
  json: { signInMode: 'SignInAndRegister' },
});
