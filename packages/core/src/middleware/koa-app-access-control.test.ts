import type { Provider } from 'oidc-provider';
import Sinon from 'sinon';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { markAppLevelAccessControlChecked } from '#src/oidc/application-access-control.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import koaAppAccessControl from './koa-app-access-control.js';

const { jest } = import.meta;
type InteractionDetails = Awaited<ReturnType<Provider['interactionDetails']>>;

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

  const createContext = (interactionDetails: Partial<InteractionDetails>) => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- minimal interaction details stub for middleware testing
    const details = {
      persist: jest.fn(),
      ...interactionDetails,
    } as InteractionDetails;

    return {
      ...createContextWithRouteParameters({
        url: `/consent`,
      }),
      interactionDetails: details,
    };
  };

  it('should assert application access before next middleware', async () => {
    const ctx = createContext({
      params: { client_id: 'app-id' },
      // @ts-expect-error
      session: { accountId: 'user-id' },
    });
    const guard = koaAppAccessControl(mockTenant.envSet, mockTenant.libraries);

    await guard(ctx, next);

    expect(assertUserHasApplicationAccess).toHaveBeenCalledWith('app-id', 'user-id');
    expect(ctx.interactionDetails.persist).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should skip duplicated application access check in the same interaction', async () => {
    const ctx = createContext({
      params: { client_id: 'app-id' },
      // @ts-expect-error
      session: { accountId: 'user-id' },
      result: markAppLevelAccessControlChecked(undefined, 'app-id', 'user-id'),
    });
    const guard = koaAppAccessControl(mockTenant.envSet, mockTenant.libraries);

    await guard(ctx, next);

    expect(assertUserHasApplicationAccess).not.toHaveBeenCalled();
    expect(ctx.interactionDetails.persist).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should not skip application access check with last submission marker', async () => {
    const ctx = createContext({
      params: { client_id: 'app-id' },
      // @ts-expect-error
      session: { accountId: 'user-id' },
      lastSubmission: markAppLevelAccessControlChecked(undefined, 'app-id', 'user-id'),
    });
    const guard = koaAppAccessControl(mockTenant.envSet, mockTenant.libraries);

    await guard(ctx, next);

    expect(assertUserHasApplicationAccess).toHaveBeenCalledWith('app-id', 'user-id');
    expect(ctx.interactionDetails.persist).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should throw when access is denied', async () => {
    const ctx = createContext({
      params: { client_id: 'app-id' },
      // @ts-expect-error
      session: { accountId: 'user-id' },
    });
    assertUserHasApplicationAccess.mockRejectedValueOnce(new RequestError('oidc.access_denied'));
    const guard = koaAppAccessControl(mockTenant.envSet, mockTenant.libraries);

    await expect(guard(ctx, next)).rejects.toMatchObject({ code: 'oidc.access_denied' });
    expect(ctx.interactionDetails.persist).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it('should throw an error if session is not found', async () => {
    const ctx = createContext({
      params: { client_id: 'app-id' },
      session: undefined,
    });
    const guard = koaAppAccessControl(mockTenant.envSet, mockTenant.libraries);

    await expect(guard(ctx, next)).rejects.toThrow(new RequestError({ code: 'session.not_found' }));
  });

  describe('while CIMD is effectively enabled', () => {
    const cimdClientId = 'https://client.example.com/metadata.json';

    /**
     * The gate reads only `oidc.cimdEnabled` from the tenant env set; the static SSRF flag is
     * stubbed onto `EnvSet.values` below.
     */
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- minimal env-set stub scoped to the field the gate reads
    const cimdEnvSet = { oidc: { cimdEnabled: true } } as EnvSet;

    beforeEach(() => {
      Sinon.stub(EnvSet, 'values').value({
        ...EnvSet.values,
        isOidcProviderSsrfProtectionEnabled: true,
      });
    });

    afterEach(() => {
      Sinon.restore();
    });

    it('should skip the application access check for a cimd client', async () => {
      const ctx = createContext({
        params: { client_id: cimdClientId },
        // @ts-expect-error -- minimal session stub for middleware testing
        session: { accountId: 'user-id' },
      });
      const guard = koaAppAccessControl(cimdEnvSet, mockTenant.libraries);

      await guard(ctx, next);

      expect(assertUserHasApplicationAccess).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalled();
    });

    it('should keep the access check for a url client id when CIMD is not effectively enabled', async () => {
      const ctx = createContext({
        params: { client_id: cimdClientId },
        // @ts-expect-error -- minimal session stub for middleware testing
        session: { accountId: 'user-id' },
      });
      const guard = koaAppAccessControl(mockTenant.envSet, mockTenant.libraries);

      await guard(ctx, next);

      expect(assertUserHasApplicationAccess).toHaveBeenCalledWith(cimdClientId, 'user-id');
      expect(next).toHaveBeenCalled();
    });

    it('should keep the access check for a registered client while CIMD is effectively enabled', async () => {
      const ctx = createContext({
        params: { client_id: 'app-id' },
        // @ts-expect-error -- minimal session stub for middleware testing
        session: { accountId: 'user-id' },
      });
      const guard = koaAppAccessControl(cimdEnvSet, mockTenant.libraries);

      await guard(ctx, next);

      expect(assertUserHasApplicationAccess).toHaveBeenCalledWith('app-id', 'user-id');
      expect(next).toHaveBeenCalled();
    });
  });
});
