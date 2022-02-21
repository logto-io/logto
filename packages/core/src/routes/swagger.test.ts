import { createRequester } from '@/utils/test-utils';

import statusRoutes from './status';
import swaggerRoutes from './swagger';
import { AnonymousRouter } from './types';

describe('swagger api', () => {
  const swaggerRequest = createRequester<AnonymousRouter>(swaggerRoutes, statusRoutes);

  it('GET /swagger', async () => {
    const response = await swaggerRequest.get('/swagger.json');
    expect(response.status).toEqual(200);
    expect(response.body).toHaveProperty('openapi');
    expect(response.body).toHaveProperty('info');

    // TODO: find a better way to test the paths details should contain api list
    expect(response.body).toHaveProperty('paths');
  });
});
