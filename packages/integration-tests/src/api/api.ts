import { got } from 'got';

import { logtoConsoleUrl, logtoUrl } from '#src/constants.js';

const api = got.extend({
  prefixUrl: new URL('/api', logtoUrl),
});

export default api;

// TODO: @gao rename
export const authedAdminApi = api.extend({
  headers: {
    'development-user-id': 'integration-test-admin-user',
  },
});

export const adminTenantApi = got.extend({
  prefixUrl: new URL('/api', logtoConsoleUrl),
});

export const authedAdminTenantApi = adminTenantApi.extend({
  headers: {
    'development-user-id': 'integration-test-admin-user',
  },
});
