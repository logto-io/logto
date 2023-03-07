import { isKeyInObject } from '@logto/shared';

import { buildRequestContext, createHttpContext } from '#src/test-utils/context.js';

import router from './index.js';

describe('GET /api/status', () => {
  it('should set status to 204', async () => {
    await router.routes()(
      buildRequestContext('GET /api/status'),
      async ({ status, json, stream }) => {
        expect(status).toBe(204);
        expect(json).toBe(undefined);
        expect(stream).toBe(undefined);
      },
      createHttpContext()
    );
  });
});

describe('GET /api/teapot', () => {
  it('should refuse to brew coffee', async () => {
    await router.routes()(
      buildRequestContext('GET /api/teapot'),
      async ({ status, json, stream }) => {
        expect(status).toBe(418);
        expect(isKeyInObject(json, 'message')).toBeTruthy();
        expect(stream).toBe(undefined);
      },
      createHttpContext()
    );
  });
});
