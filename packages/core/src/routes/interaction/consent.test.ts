import type { User } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';

import { mockUser } from '#src/__mocks__/index.js';
import type Queries from '#src/tenants/Queries.js';
import { createMockProvider, GrantMock } from '#src/test-utils/oidc-provider.test.js';
import type { Partial2 } from '#src/test-utils/tenant.test.js';
import { MockTenant } from '#src/test-utils/tenant.test.js';
import { createRequester } from '#src/utils/test-utils.test.js';

import { interactionPrefix } from './const.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const grantSave = jest.fn(async () => 'finalGrantId');
const grantAddOIDCScope = jest.fn();
const grantAddResourceScope = jest.fn();

class Grant extends GrantMock {
  static async find(id: string) {
    return id === 'exists' ? new Grant() : undefined;
  }

  constructor() {
    super();
    this.save = grantSave;
    this.addOIDCScope = grantAddOIDCScope;
    this.addResourceScope = grantAddResourceScope;
  }
}

const userQueries = {
  findUserById: jest.fn(async (): Promise<User> => mockUser),
  updateUserById: jest.fn(async (..._args: unknown[]) => ({ id: 'id' })),
};
const { findUserById, updateUserById } = userQueries;

// @ts-expect-error
const queries: Partial2<Queries> = { users: userQueries };

const { assignInteractionResults } = await mockEsmWithActual('#src/libraries/session.js', () => ({
  assignInteractionResults: jest.fn(),
}));

const { default: interactionRoutes } = await import('./index.js');

describe('interaction -> consent', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const baseInteractionDetails = {
    session: { accountId: mockUser.id },
    params: { client_id: 'clientId' },
    prompt: { details: {} },
  };

  it('with empty details and reusing old grant', async () => {
    const sessionRequest = createRequester({
      anonymousRoutes: interactionRoutes,
      tenantContext: new MockTenant(
        createMockProvider(jest.fn().mockResolvedValue(baseInteractionDetails), Grant),
        queries
      ),
    });

    await sessionRequest.post(`${interactionPrefix}/consent`);
    expect(grantSave).toHaveBeenCalled();
    expect(assignInteractionResults).toBeCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        consent: { grantId: 'finalGrantId' },
      }),
      true
    );
  });

  it('with empty details and creating new grant', async () => {
    const sessionRequest = createRequester({
      anonymousRoutes: interactionRoutes,
      tenantContext: new MockTenant(
        createMockProvider(
          jest.fn().mockResolvedValue({
            ...baseInteractionDetails,
            grantId: 'exists',
          }),
          Grant
        ),
        queries
      ),
    });

    await sessionRequest.post(`${interactionPrefix}/consent`);

    expect(grantSave).toHaveBeenCalled();
    expect(assignInteractionResults).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        consent: { grantId: 'finalGrantId' },
      }),
      expect.anything()
    );
  });

  it('should save application id when the user first consented', async () => {
    const sessionRequest = createRequester({
      anonymousRoutes: interactionRoutes,
      tenantContext: new MockTenant(
        createMockProvider(
          jest.fn().mockResolvedValue({
            ...baseInteractionDetails,
            prompt: {
              name: 'consent',
              details: {},
              reasons: ['consent_prompt', 'native_client_prompt'],
            },
          }),
          Grant
        ),
        queries
      ),
    });

    findUserById.mockImplementationOnce(async () => ({ ...mockUser, applicationId: null }));

    await sessionRequest.post(`${interactionPrefix}/consent`);
    expect(updateUserById).toHaveBeenCalledWith(mockUser.id, { applicationId: 'clientId' });
  });

  it('missingOIDCScope and missingResourceScopes', async () => {
    const sessionRequest = createRequester({
      anonymousRoutes: interactionRoutes,
      tenantContext: new MockTenant(
        createMockProvider(
          jest.fn().mockResolvedValue({
            ...baseInteractionDetails,
            prompt: {
              details: {
                missingOIDCScope: ['scope1', 'scope2'],
                missingResourceScopes: {
                  resource1: ['scope1', 'scope2'],
                  resource2: ['scope3'],
                },
              },
            },
          }),
          Grant
        ),
        queries
      ),
    });

    await sessionRequest.post(`${interactionPrefix}/consent`);
    expect(grantAddOIDCScope).toHaveBeenCalledWith('scope1 scope2');
    expect(grantAddResourceScope).toHaveBeenCalledWith('resource1', 'scope1 scope2');
    expect(grantAddResourceScope).toHaveBeenCalledWith('resource2', 'scope3');
    expect(assignInteractionResults).toHaveBeenCalledWith(
      expect.anything(),
      expect.anything(),
      expect.objectContaining({
        consent: { grantId: 'finalGrantId' },
      }),
      expect.anything()
    );
  });
});
