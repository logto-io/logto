import { readOnlyAccessHeader } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import { mockApplication } from '#src/__mocks__/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';

const { jest } = import.meta;

const legacyApplication = { ...mockApplication, secret: 'legacy-secret' };
const findApplicationById = jest.fn(async () => legacyApplication);
const findApplications = jest.fn(async () => [legacyApplication]);

const tenantContext = new MockTenant(undefined, {
  applications: { findApplicationById, findApplications },
});

const { createRequester } = await import('#src/utils/test-utils.js');
const { default: koaReadOnlyAccess } = await import('#src/middleware/koa-read-only-access.js');
const applicationRoutes = await pickDefault(import('./application.js'));

describe('application routes with read-only access', () => {
  const applicationRequest = createRequester({
    authedRoutes: (router, tenant) => {
      router.use(koaReadOnlyAccess());
      applicationRoutes(router, tenant);
    },
    tenantContext,
  });

  it('omits a legacy secret from GET /applications/:id', async () => {
    const response = await applicationRequest
      .get('/applications/foo')
      .set(readOnlyAccessHeader, 'true');

    expect(response.status).toEqual(200);
    expect(response.body).not.toHaveProperty('secret');
  });

  it('omits a legacy secret from GET /applications', async () => {
    const response = await applicationRequest
      .get('/applications')
      .set(readOnlyAccessHeader, 'true');

    expect(response.status).toEqual(200);
    expect(response.body).toEqual([expect.not.objectContaining({ secret: 'legacy-secret' })]);
  });

  it('keeps a legacy secret without the header', async () => {
    const response = await applicationRequest.get('/applications/foo');

    expect(response.body).toHaveProperty('secret', 'legacy-secret');
  });
});
