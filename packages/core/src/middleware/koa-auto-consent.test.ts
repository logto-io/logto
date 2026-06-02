import type { Provider } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import koaAutoConsent from './koa-auto-consent.js';

const { jest } = import.meta;
type InteractionDetails = Awaited<ReturnType<Provider['interactionDetails']>>;
type ApplicationQueries = Queries['applications'];
const prompt = {
  name: 'consent',
  reasons: [],
  details: {},
} satisfies InteractionDetails['prompt'];

const createContext = (interactionDetails: Partial<InteractionDetails>, redirect = jest.fn()) => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- minimal interaction details stub for middleware testing
  const details = {
    params: {},
    ...interactionDetails,
  } as InteractionDetails;

  return {
    ...createContextWithRouteParameters({
      url: '/consent',
      redirect,
    }),
    interactionDetails: details,
  };
};

const createTenant = ({
  isThirdParty = false,
  assertUserHasApplicationAccess = jest.fn(async () => {
    await Promise.resolve();
  }),
}: {
  readonly isThirdParty?: boolean;
  readonly assertUserHasApplicationAccess?: jest.Mock;
} = {}) => {
  const findApplicationById = jest.fn(async () => ({
    isThirdParty,
  })) as unknown as ApplicationQueries['findApplicationById'];

  return {
    findApplicationById,
    tenant: new MockTenant(
      undefined,
      {
        applications: { findApplicationById },
      },
      undefined,
      {
        applicationAccessControl: { assertUserHasApplicationAccess },
      }
    ),
  };
};

describe('koaAutoConsent middleware', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should continue to the consent SPA when auto-consent application access is denied', async () => {
    const accessDeniedError = new RequestError('oidc.access_denied');
    const assertUserHasApplicationAccess = jest.fn(async () => {
      throw accessDeniedError;
    });
    const { findApplicationById, tenant } = createTenant({ assertUserHasApplicationAccess });
    const redirect = jest.fn();
    const next = jest.fn();
    const ctx = createContext(
      {
        params: { client_id: 'app-id' },
        prompt,
        // @ts-expect-error
        session: { accountId: 'user-id' },
      },
      redirect
    );
    const guard = koaAutoConsent({} as Provider, tenant.queries, tenant.libraries);

    await guard(ctx, next);

    expect(findApplicationById).toHaveBeenCalledWith('app-id');
    expect(assertUserHasApplicationAccess).toHaveBeenCalledWith('app-id', 'user-id');
    expect(redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should not check application access for third-party applications', async () => {
    const assertUserHasApplicationAccess = jest.fn();
    const { tenant } = createTenant({ isThirdParty: true, assertUserHasApplicationAccess });
    const next = jest.fn();
    const ctx = createContext({
      params: { client_id: 'app-id' },
      prompt,
      // @ts-expect-error
      session: { accountId: 'user-id' },
    });
    const guard = koaAutoConsent({} as Provider, tenant.queries, tenant.libraries);

    await guard(ctx, next);

    expect(assertUserHasApplicationAccess).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it('should throw non-access-denied application access errors', async () => {
    const error = new RequestError({ code: 'request.invalid_input' });
    const assertUserHasApplicationAccess = jest.fn(async () => {
      throw error;
    });
    const { tenant } = createTenant({ assertUserHasApplicationAccess });
    const next = jest.fn();
    const ctx = createContext({
      params: { client_id: 'app-id' },
      prompt,
      // @ts-expect-error
      session: { accountId: 'user-id' },
    });
    const guard = koaAutoConsent({} as Provider, tenant.queries, tenant.libraries);

    await expect(guard(ctx, next)).rejects.toBe(error);
    expect(next).not.toHaveBeenCalled();
  });
});
