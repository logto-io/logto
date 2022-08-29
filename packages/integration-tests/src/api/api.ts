import got from 'got';

import { logtoUrl } from '@/constants';

const requestTimeout = 10_000;

export default got.extend({ prefixUrl: new URL('/api', logtoUrl), timeout: requestTimeout });

export const authedAdminApi = got.extend({
  prefixUrl: new URL('/api', logtoUrl),
  headers: {
    'development-user-id': 'integration-test-admin-user',
  },
  timeout: requestTimeout,
});
