import { CloudScope } from '@logto/schemas';

import { buildRequestAuthContext, createHttpContext } from '#src/test-utils/context.js';
import { noop } from '#src/test-utils/function.js';
import { MockServicesLibrary } from '#src/test-utils/libraries.js';

import { servicesRoutes } from './services.js';

describe('POST /api/services/send-email', () => {
  const library = new MockServicesLibrary();
  const router = servicesRoutes(library);

  it('should throw 403 when lack of permission', async () => {
    await expect(
      router.routes()(
        buildRequestAuthContext('POST /services/send-email')(),
        noop,
        createHttpContext()
      )
    ).rejects.toMatchObject({ status: 403 });
  });

  it('should return 201', async () => {
    library.getTenantIdFromApplicationId.mockResolvedValueOnce('tenantId');

    await router.routes()(
      buildRequestAuthContext('POST /services/send-email')([CloudScope.SendEmail]),
      async ({ status }) => {
        expect(status).toBe(201);
      },
      createHttpContext()
    );
  });
});
