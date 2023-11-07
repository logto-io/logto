import { got } from 'got';

import { logtoConsoleUrl, logtoUrl, logtoCloudUrl } from '#src/constants.js';

const api = got.extend({
  prefixUrl: new URL('/api', logtoUrl),
  timeout: { response: 5000 }, // The default is 60s which is way too long for tests.
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

export const cloudApi = got.extend({
  prefixUrl: new URL('/api', logtoCloudUrl),
});
