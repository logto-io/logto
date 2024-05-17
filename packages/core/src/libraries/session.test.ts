import { type User } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import type Provider from 'oidc-provider';

import { mockUser } from '#src/__mocks__/user.js';
import type Queries from '#src/tenants/Queries.js';
import { GrantMock, createMockProvider } from '#src/test-utils/oidc-provider.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { consent } from './session.js';

const { jest } = import.meta;

const grantSave = jest.fn(async (id: string) => id);
const grantAddOIDCScope = jest.fn();
const grantAddResourceScope = jest.fn();

class Grant extends GrantMock {
  static async find(id: string) {
    return id === 'exists' ? existGrant : undefined;
  }

  id: string;

  accountId?: string;

  constructor() {
    super();
    this.id = generateStandardId();
    this.save = async () => grantSave(this.id);
    this.addOIDCScope = grantAddOIDCScope;
    this.addResourceScope = grantAddResourceScope;
  }
}

const existGrant = new Grant();

const userQueries = {
  findUserById: jest.fn(async (): Promise<User> => mockUser),
  updateUserById: jest.fn(async (..._args: unknown[]) => ({ id: 'id' })),
};

// @ts-expect-error
const queries: Queries = { users: userQueries };
const context = createContextWithRouteParameters();

type Interaction = Awaited<ReturnType<Provider['interactionDetails']>>;

describe('consent', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const baseInteractionDetails = {
    session: { accountId: mockUser.id },
    params: { client_id: 'clientId' },
    prompt: { details: {} },
  } as unknown as Interaction;

  it('should update with new grantId if not exist', async () => {
    const provider = createMockProvider(jest.fn().mockResolvedValue(baseInteractionDetails), Grant);
    await consent({ ctx: context, provider, queries, interactionDetails: baseInteractionDetails });

    expect(grantSave).toHaveBeenCalled();

    expect(provider.interactionResult).toHaveBeenCalledWith(
      context.req,
      context.res,
      {
        ...baseInteractionDetails.result,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        consent: { grantId: expect.any(String) },
      },
      {
        mergeWithLastSubmission: true,
      }
    );
  });

  it('should update with existing grantId if exist', async () => {
    const interactionDetails = {
      ...baseInteractionDetails,
      grantId: 'exists',
    } as unknown as Interaction;

    const provider = createMockProvider(jest.fn().mockResolvedValue(interactionDetails), Grant);

    await consent({ ctx: context, provider, queries, interactionDetails });

    expect(grantSave).toHaveBeenCalled();

    expect(provider.interactionResult).toHaveBeenCalledWith(
      context.req,
      context.res,
      {
        ...baseInteractionDetails.result,
        consent: { grantId: existGrant.id },
      },
      {
        mergeWithLastSubmission: true,
      }
    );
  });

  it('should save first consented app id', async () => {
    userQueries.findUserById.mockImplementationOnce(async () => ({
      ...mockUser,
      applicationId: null,
    }));

    const provider = createMockProvider(jest.fn().mockResolvedValue(baseInteractionDetails), Grant);
    await consent({ ctx: context, provider, queries, interactionDetails: baseInteractionDetails });

    expect(userQueries.updateUserById).toHaveBeenCalledWith(mockUser.id, {
      applicationId: baseInteractionDetails.params.client_id,
    });
  });

  it('should grant missing scopes', async () => {
    const provider = createMockProvider(jest.fn().mockResolvedValue(baseInteractionDetails), Grant);
    await consent({
      ctx: context,
      provider,
      queries,
      interactionDetails: baseInteractionDetails,
      missingOIDCScopes: ['openid', 'profile'],
      resourceScopesToGrant: {
        resource1: ['resource1_scope1', 'resource1_scope2'],
        resource2: ['resource2_scope1'],
      },
    });

    expect(grantAddOIDCScope).toHaveBeenCalledWith('openid profile');
    expect(grantAddResourceScope).toHaveBeenCalledWith(
      'resource1',
      'resource1_scope1 resource1_scope2'
    );
    expect(grantAddResourceScope).toHaveBeenCalledWith('resource2', 'resource2_scope1');
  });
});
