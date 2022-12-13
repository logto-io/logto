import { got } from 'got';

import { logtoUrl } from '#src/constants.js';

export default got.extend({ prefixUrl: new URL('/api', logtoUrl) });

export const authedAdminApi = got.extend({
  prefixUrl: new URL('/api', logtoUrl),
  headers: {
    'development-user-id': 'integration-test-admin-user',
  },
});
