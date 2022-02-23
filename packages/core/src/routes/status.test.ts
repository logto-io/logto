import { createRequester } from '@/utils/test-utils';

import statusRoutes from './status';

describe('status router', () => {
  const requester = createRequester({ anonymousRoutes: statusRoutes });
  it('GET /status', async () => {
    await expect(requester.get('/status')).resolves.toHaveProperty('status', 204);
  });
});
