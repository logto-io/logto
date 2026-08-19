import { type User } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import type { Provider } from 'oidc-provider';
import Sinon from 'sinon';

import { mockUser } from '#src/__mocks__/user.js';
import { EnvSet } from '#src/env-set/index.js';
import type Queries from '#src/tenants/Queries.js';
import { mockEnvSet } from '#src/test-utils/env-set.js';
import { GrantMock, createMockProvider } from '#src/test-utils/oidc-provider.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { consent } from './index.js';

const { jest } = import.meta;

class Grant extends GrantMock {
  id: string;

  constructor() {
    super();
    this.id = generateStandardId();
  }
}

const oidcSessionExtensionsInsert = jest.fn(async () => ({ ok: true }));
const userQueries = {
  findUserById: jest.fn(async (): Promise<User> => mockUser),
  updateUserById: jest.fn(async (..._args: unknown[]) => ({ id: 'id' })),
};

const queries = {
  users: userQueries,
  oidcSessionExtensions: { insert: oidcSessionExtensionsInsert },
  cimd: { grantClientSnapshots: { insert: jest.fn() } },
} as unknown as Queries;
const context = createContextWithRouteParameters();

type Interaction = Awaited<ReturnType<Provider['interactionDetails']>>;

const buildInteractionDetails = (clientId: string) =>
  ({
    session: { accountId: mockUser.id, uid: 'sessionUid' },
    params: { client_id: clientId },
    prompt: { details: {} },
    lastSubmission: { foo: 'bar' },
  }) as unknown as Interaction;

describe('saveInteractionLastSubmissionToSession', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should persist lastSubmission to session', async () => {
    const signInContext = { country: 'US' };
    const interactionDetails = {
      session: { accountId: mockUser.id, uid: 'sessionUid' },
      params: { client_id: 'clientId' },
      prompt: { details: {} },
      lastSubmission: { foo: 'bar' },
      result: { signInContext },
    } as unknown as Interaction;

    const provider = createMockProvider(jest.fn().mockResolvedValue(interactionDetails), Grant);

    await consent({
      ctx: context,
      provider,
      envSet: mockEnvSet,
      queries,
      interactionDetails,
    });

    expect(oidcSessionExtensionsInsert).toHaveBeenCalledWith({
      sessionUid: 'sessionUid',
      accountId: mockUser.id,
      lastSubmission: { foo: 'bar' },
      clientId: 'clientId',
      cimdClientId: null,
    });
  });
});

describe('saveInteractionLastSubmissionToSession while CIMD is effectively enabled', () => {
  const cimdClientId = 'https://client.example.com/metadata.json';

  /**
   * The gate reads only `oidc.cimdEnabled` from the tenant env set; the static flags are
   * stubbed onto `EnvSet.values` below.
   */
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- minimal env-set stub scoped to the field the gate reads
  const cimdEnvSet = { oidc: { cimdEnabled: true } } as EnvSet;

  /** The grant client snapshot path resolves the client for its display data. */
  const cimdClient = { find: async (): Promise<unknown> => ({ clientName: 'Example App' }) };

  beforeEach(() => {
    Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      isOidcProviderSsrfProtectionEnabled: true,
    });
  });

  afterEach(() => {
    Sinon.restore();
    jest.clearAllMocks();
  });

  it('should write a cimd client identifier to the dedicated column for a cimd-first user', async () => {
    userQueries.findUserById.mockImplementationOnce(async () => ({
      ...mockUser,
      applicationId: null,
      cimdClientId: null,
    }));
    const interactionDetails = buildInteractionDetails(cimdClientId);
    const provider = createMockProvider(
      jest.fn().mockResolvedValue(interactionDetails),
      Grant,
      cimdClient
    );

    await consent({
      ctx: context,
      provider,
      envSet: cimdEnvSet,
      queries,
      interactionDetails,
    });

    expect(oidcSessionExtensionsInsert).toHaveBeenCalledWith({
      sessionUid: 'sessionUid',
      accountId: mockUser.id,
      lastSubmission: { foo: 'bar' },
      clientId: null,
      cimdClientId,
    });
    expect(userQueries.updateUserById).toHaveBeenCalledTimes(1);
    expect(userQueries.updateUserById).toHaveBeenCalledWith(mockUser.id, { cimdClientId });
  });

  it('should not overwrite an existing first-consent cimd attribution', async () => {
    userQueries.findUserById.mockImplementationOnce(async () => ({
      ...mockUser,
      applicationId: null,
      cimdClientId: 'https://first.example.com/metadata.json',
    }));
    const interactionDetails = buildInteractionDetails(cimdClientId);
    const provider = createMockProvider(
      jest.fn().mockResolvedValue(interactionDetails),
      Grant,
      cimdClient
    );

    await consent({
      ctx: context,
      provider,
      envSet: cimdEnvSet,
      queries,
      interactionDetails,
    });

    expect(userQueries.updateUserById).not.toHaveBeenCalled();
  });

  it('should not write the cimd column for a user attributed to a registered application', async () => {
    userQueries.findUserById.mockImplementationOnce(async () => ({
      ...mockUser,
      applicationId: 'bar',
      cimdClientId: null,
    }));
    const interactionDetails = buildInteractionDetails(cimdClientId);
    const provider = createMockProvider(
      jest.fn().mockResolvedValue(interactionDetails),
      Grant,
      cimdClient
    );

    await consent({
      ctx: context,
      provider,
      envSet: cimdEnvSet,
      queries,
      interactionDetails,
    });

    expect(userQueries.updateUserById).not.toHaveBeenCalled();
  });

  it('should not write the app attribution for a cimd-first user consenting to a registered application', async () => {
    userQueries.findUserById.mockImplementationOnce(async () => ({
      ...mockUser,
      applicationId: null,
      cimdClientId: 'https://first.example.com/metadata.json',
    }));
    const interactionDetails = buildInteractionDetails('registeredClientId');
    const provider = createMockProvider(jest.fn().mockResolvedValue(interactionDetails), Grant);

    await consent({
      ctx: context,
      provider,
      envSet: cimdEnvSet,
      queries,
      interactionDetails,
    });

    expect(userQueries.updateUserById).not.toHaveBeenCalled();
  });

  it('should write a registered client identifier to the client id column and save the app attribution', async () => {
    userQueries.findUserById.mockImplementationOnce(async () => ({
      ...mockUser,
      applicationId: null,
      cimdClientId: null,
    }));
    const interactionDetails = buildInteractionDetails('registeredClientId');
    const provider = createMockProvider(jest.fn().mockResolvedValue(interactionDetails), Grant);

    await consent({
      ctx: context,
      provider,
      envSet: cimdEnvSet,
      queries,
      interactionDetails,
    });

    expect(oidcSessionExtensionsInsert).toHaveBeenCalledWith({
      sessionUid: 'sessionUid',
      accountId: mockUser.id,
      lastSubmission: { foo: 'bar' },
      clientId: 'registeredClientId',
      cimdClientId: null,
    });
    expect(userQueries.updateUserById).toHaveBeenCalledTimes(1);
    expect(userQueries.updateUserById).toHaveBeenCalledWith(mockUser.id, {
      applicationId: 'registeredClientId',
    });
  });
});
