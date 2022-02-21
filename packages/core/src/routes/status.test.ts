import { createRequester } from '@/utils/test-utils';

import statusRoutes from './status';
import { AnonymousRouter } from './types';

describe('status router', () => {
  const requester = createRequester<AnonymousRouter>(statusRoutes);
  it('GET /status', async () => {
    await expect(requester.get('/status')).resolves.toHaveProperty('status', 204);
  });
});
