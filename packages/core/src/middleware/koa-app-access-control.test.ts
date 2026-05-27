import RequestError from '#src/errors/RequestError/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import koaAppAccessControl from './koa-app-access-control.js';

const { jest } = import.meta;

describe('koaAppAccessControl middleware', () => {
  const assertUserHasApplicationAccess = jest.fn(async () => {
    await Promise.resolve();
  });
  const mockTenant = new MockTenant(undefined, undefined, undefined, {
    applicationAccessControl: { assertUserHasApplicationAccess },
  });
  const next = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createContext = (
    interactionDetails: Partial<Awaited<ReturnType<typeof mockTenant.provider.interactionDetails>>>
  ) => ({
    ...createContextWithRouteParameters({
      url: `/consent`,
    }),
    interactionDetails: interactionDetails as Awaited<
      ReturnType<typeof mockTenant.provider.interactionDetails>
    >,
  });

  it('should assert application access before next middleware', async () => {
    const ctx = createContext({
      params: { client_id: 'app-id' },
      // @ts-expect-error
      session: { accountId: 'user-id' },
    });
    const guard = koaAppAccessControl(mockTenant.libraries);

    await guard(ctx, next);

    expect(assertUserHasApplicationAccess).toHaveBeenCalledWith('app-id', 'user-id');
    expect(next).toHaveBeenCalled();
  });

  it('should throw when access is denied', async () => {
    const ctx = createContext({
      params: { client_id: 'app-id' },
      // @ts-expect-error
      session: { accountId: 'user-id' },
    });
    assertUserHasApplicationAccess.mockRejectedValueOnce(new RequestError('oidc.access_denied'));
    const guard = koaAppAccessControl(mockTenant.libraries);

    await expect(guard(ctx, next)).rejects.toMatchObject({ code: 'oidc.access_denied' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should throw an error if session is not found', async () => {
    const ctx = createContext({
      params: { client_id: 'app-id' },
      session: undefined,
    });
    const guard = koaAppAccessControl(mockTenant.libraries);

    await expect(guard(ctx, next)).rejects.toThrow(new RequestError({ code: 'session.not_found' }));
  });
});
