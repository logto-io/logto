import { appendPath } from '@silverhand/essentials';
import { got } from 'got';

import { logtoConsoleUrl, logtoUrl, logtoCloudUrl } from '#src/constants.js';

const api = got.extend({
  prefixUrl: appendPath(new URL(logtoUrl), 'api'),
});

export default api;

// TODO: @gao rename
export const authedAdminApi = api.extend({
  headers: {
    'development-user-id': 'integration-test-admin-user',
  },
});

export const adminTenantApi = got.extend({
  prefixUrl: appendPath(new URL(logtoConsoleUrl), 'api'),
});

export const authedAdminTenantApi = adminTenantApi.extend({
  headers: {
    'development-user-id': 'integration-test-admin-user',
  },
});

export const cloudApi = got.extend({
  prefixUrl: appendPath(new URL(logtoCloudUrl), 'api'),
});

export const oidcApi = got.extend({
  prefixUrl: appendPath(new URL(logtoUrl), 'oidc'),
});
