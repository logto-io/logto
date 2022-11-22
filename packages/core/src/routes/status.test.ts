import { createRequester } from '#src/utils/test-utils.js';

import statusRoutes from './status.js';

describe('status router', () => {
  const requester = createRequester({ anonymousRoutes: statusRoutes });
  it('GET /status', async () => {
    await expect(requester.get('/status')).resolves.toHaveProperty('status', 204);
  });
});
