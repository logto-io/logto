import { type User } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { errors, type Provider } from 'oidc-provider';
import Sinon from 'sinon';

import { mockUser } from '#src/__mocks__/user.js';
import { EnvSet } from '#src/env-set/index.js';
import type Queries from '#src/tenants/Queries.js';
import { GrantMock, createMockProvider } from '#src/test-utils/oidc-provider.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { consent } from './index.js';

const { jest } = import.meta;

const grantSave = jest.fn(async (id: string) => id);

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
  }
}

const existGrant = new Grant();

const userQueries = {
  findUserById: jest.fn(async (): Promise<User> => mockUser),
  updateUserById: jest.fn(async (..._args: unknown[]) => ({ id: 'id' })),
};

const insertGrantOrganization = jest.fn();
const findGrantOrganizationIds = jest.fn(async () => ['org_id']);
const insertGrantClientSnapshot = jest.fn();

const queries: Queries = {
  // @ts-expect-error -- partial mock of the user queries
  users: userQueries,
  // @ts-expect-error -- partial mock of the cimd queries
  cimd: {
    grantOrganizations: {
      insert: insertGrantOrganization,
      findOrganizationIds: findGrantOrganizationIds,
      exists: jest.fn(),
    },
    grantClientSnapshots: {
      insert: insertGrantClientSnapshot,
    },
  },
};
const context = createContextWithRouteParameters();

type Interaction = Awaited<ReturnType<Provider['interactionDetails']>>;

describe('consent for a cimd client', () => {
  const cimdClientId = 'https://client.example.com/metadata.json';

  /**
   * The gate reads only `oidc.cimdEnabled` from the tenant env set; the static flags are
   * stubbed onto `EnvSet.values` below.
   */
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- minimal env-set stub scoped to the field the gate reads
  const cimdEnvSet = { oidc: { cimdEnabled: true } } as EnvSet;

  const cimdInteractionDetails = {
    session: { accountId: mockUser.id },
    params: { client_id: cimdClientId },
    prompt: { details: {} },
  } as unknown as Interaction;

  const findClient = jest.fn(
    async (): Promise<unknown> => ({
      clientName: 'Example App',
      logoUri: 'https://client.example.com/logo.png',
    })
  );

  const createCimdProvider = (interactionDetails: Interaction) =>
    createMockProvider(jest.fn().mockResolvedValue(interactionDetails), Grant, {
      find: findClient,
    });

  beforeEach(() => {
    Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      isDevFeaturesEnabled: true,
      isOidcProviderSsrfProtectionEnabled: true,
    });
  });

  afterEach(() => {
    Sinon.restore();
    jest.clearAllMocks();
  });

  it('should write the client snapshot after the grant is saved when no organization is selected', async () => {
    const provider = createCimdProvider(cimdInteractionDetails);
    await consent({
      ctx: context,
      provider,
      envSet: cimdEnvSet,
      queries,
      interactionDetails: cimdInteractionDetails,
    });

    expect(findClient).toHaveBeenCalledWith(cimdClientId);
    expect(insertGrantClientSnapshot).toHaveBeenCalledWith({
      grantId: grantSave.mock.calls[0]?.[0],
      clientId: cimdClientId,
      name: 'Example App',
      logoUri: 'https://client.example.com/logo.png',
    });
    expect(grantSave.mock.invocationCallOrder[0]).toBeLessThan(
      insertGrantClientSnapshot.mock.invocationCallOrder[0] ?? 0
    );
    expect(insertGrantOrganization).not.toHaveBeenCalled();
  });

  it('should write the client snapshot and the grant-scoped organization row after the grant is saved', async () => {
    const provider = createCimdProvider(cimdInteractionDetails);
    await consent({
      ctx: context,
      provider,
      envSet: cimdEnvSet,
      queries,
      interactionDetails: cimdInteractionDetails,
      cimdOrganizationId: 'org_id',
    });

    expect(insertGrantClientSnapshot).toHaveBeenCalledWith({
      grantId: grantSave.mock.calls[0]?.[0],
      clientId: cimdClientId,
      name: 'Example App',
      logoUri: 'https://client.example.com/logo.png',
    });
    expect(insertGrantOrganization).toHaveBeenCalledWith({
      grantId: grantSave.mock.calls[0]?.[0],
      organizationId: 'org_id',
      userId: mockUser.id,
    });
    expect(grantSave.mock.invocationCallOrder[0]).toBeLessThan(
      insertGrantOrganization.mock.invocationCallOrder[0] ?? 0
    );
  });

  it('should store an absent client name and logo as null', async () => {
    findClient.mockResolvedValueOnce({});
    const provider = createCimdProvider(cimdInteractionDetails);
    await consent({
      ctx: context,
      provider,
      envSet: cimdEnvSet,
      queries,
      interactionDetails: cimdInteractionDetails,
    });

    expect(insertGrantClientSnapshot).toHaveBeenCalledWith({
      grantId: grantSave.mock.calls[0]?.[0],
      clientId: cimdClientId,
      name: null,
      logoUri: null,
    });
  });

  it('should truncate an overlong client name to the column bound', async () => {
    findClient.mockResolvedValueOnce({ clientName: 'a'.repeat(300) });
    const provider = createCimdProvider(cimdInteractionDetails);
    await consent({
      ctx: context,
      provider,
      envSet: cimdEnvSet,
      queries,
      interactionDetails: cimdInteractionDetails,
    });

    expect(insertGrantClientSnapshot).toHaveBeenCalledWith({
      grantId: grantSave.mock.calls[0]?.[0],
      clientId: cimdClientId,
      name: 'a'.repeat(256),
      logoUri: null,
    });
  });

  it('should store an overlong logo uri as null', async () => {
    findClient.mockResolvedValueOnce({
      clientName: 'Example App',
      logoUri: `https://client.example.com/${'a'.repeat(2048)}.png`,
    });
    const provider = createCimdProvider(cimdInteractionDetails);
    await consent({
      ctx: context,
      provider,
      envSet: cimdEnvSet,
      queries,
      interactionDetails: cimdInteractionDetails,
    });

    expect(insertGrantClientSnapshot).toHaveBeenCalledWith({
      grantId: grantSave.mock.calls[0]?.[0],
      clientId: cimdClientId,
      name: 'Example App',
      logoUri: null,
    });
  });

  it('should fail the consent when the client can no longer be resolved', async () => {
    // eslint-disable-next-line unicorn/no-useless-undefined -- undefined is the provider's not-found result under test
    findClient.mockResolvedValueOnce(undefined);
    const provider = createCimdProvider(cimdInteractionDetails);

    await expect(
      consent({
        ctx: context,
        provider,
        envSet: cimdEnvSet,
        queries,
        interactionDetails: cimdInteractionDetails,
      })
    ).rejects.toMatchError(new errors.InvalidClient('client must be available'));
    expect(insertGrantClientSnapshot).not.toHaveBeenCalled();
    expect(provider.interactionResult).not.toHaveBeenCalled();
  });

  it('should fail the consent before the interaction result update when the snapshot write fails', async () => {
    insertGrantClientSnapshot.mockRejectedValueOnce(new Error('write failed'));
    const provider = createCimdProvider(cimdInteractionDetails);

    await expect(
      consent({
        ctx: context,
        provider,
        envSet: cimdEnvSet,
        queries,
        interactionDetails: cimdInteractionDetails,
      })
    ).rejects.toThrow('write failed');
    expect(provider.interactionResult).not.toHaveBeenCalled();
  });

  it('should fail the consent when a different organization is already authorized on the grant', async () => {
    findGrantOrganizationIds.mockResolvedValueOnce(['other_org_id']);
    const provider = createCimdProvider(cimdInteractionDetails);

    await expect(
      consent({
        ctx: context,
        provider,
        envSet: cimdEnvSet,
        queries,
        interactionDetails: cimdInteractionDetails,
        cimdOrganizationId: 'org_id',
      })
    ).rejects.toMatchError(
      new errors.InvalidRequest(
        'the grant organization binding does not match the submitted organization'
      )
    );
    expect(provider.interactionResult).not.toHaveBeenCalled();
  });

  it('should fail the consent when the organization binding is missing after the write', async () => {
    findGrantOrganizationIds.mockResolvedValueOnce([]);
    const provider = createCimdProvider(cimdInteractionDetails);

    await expect(
      consent({
        ctx: context,
        provider,
        envSet: cimdEnvSet,
        queries,
        interactionDetails: cimdInteractionDetails,
        cimdOrganizationId: 'org_id',
      })
    ).rejects.toMatchError(
      new errors.InvalidRequest(
        'the grant organization binding does not match the submitted organization'
      )
    );
    expect(provider.interactionResult).not.toHaveBeenCalled();
  });

  it('should re-write the client snapshot without failing when a retried submission reuses the grant', async () => {
    const interactionDetails = {
      ...cimdInteractionDetails,
      grantId: 'exists',
    } as unknown as Interaction;
    const provider = createCimdProvider(interactionDetails);

    await consent({
      ctx: context,
      provider,
      envSet: cimdEnvSet,
      queries,
      interactionDetails,
    });

    expect(insertGrantClientSnapshot).toHaveBeenCalledWith({
      grantId: 'exists',
      clientId: cimdClientId,
      name: 'Example App',
      logoUri: 'https://client.example.com/logo.png',
    });
    expect(insertGrantOrganization).not.toHaveBeenCalled();
    expect(provider.interactionResult).toHaveBeenCalled();
  });

  it('should write the snapshot and occupy the organization binding before changing a reused grant', async () => {
    const interactionDetails = {
      ...cimdInteractionDetails,
      grantId: 'exists',
    } as unknown as Interaction;
    const provider = createCimdProvider(interactionDetails);

    await consent({
      ctx: context,
      provider,
      envSet: cimdEnvSet,
      queries,
      interactionDetails,
      cimdOrganizationId: 'org_id',
    });

    expect(insertGrantClientSnapshot).toHaveBeenCalledWith({
      grantId: 'exists',
      clientId: cimdClientId,
      name: 'Example App',
      logoUri: 'https://client.example.com/logo.png',
    });
    expect(insertGrantOrganization).toHaveBeenCalledWith({
      grantId: 'exists',
      organizationId: 'org_id',
      userId: mockUser.id,
    });
    expect(insertGrantClientSnapshot.mock.invocationCallOrder[0]).toBeLessThan(
      grantSave.mock.invocationCallOrder[0] ?? 0
    );
    expect(insertGrantOrganization.mock.invocationCallOrder[0]).toBeLessThan(
      grantSave.mock.invocationCallOrder[0] ?? 0
    );
  });

  it('should fail before any grant change when a reused grant carries a different organization', async () => {
    findGrantOrganizationIds.mockResolvedValueOnce(['other_org_id']);
    const interactionDetails = {
      ...cimdInteractionDetails,
      grantId: 'exists',
    } as unknown as Interaction;
    const provider = createCimdProvider(interactionDetails);

    await expect(
      consent({
        ctx: context,
        provider,
        envSet: cimdEnvSet,
        queries,
        interactionDetails,
        cimdOrganizationId: 'org_id',
      })
    ).rejects.toMatchError(
      new errors.InvalidRequest(
        'the grant organization binding does not match the submitted organization'
      )
    );
    expect(grantSave).not.toHaveBeenCalled();
    expect(provider.interactionResult).not.toHaveBeenCalled();
  });

  it('should fail the consent before the interaction result update when the organization row write fails', async () => {
    insertGrantOrganization.mockRejectedValueOnce(new Error('write failed'));
    const provider = createCimdProvider(cimdInteractionDetails);

    await expect(
      consent({
        ctx: context,
        provider,
        envSet: cimdEnvSet,
        queries,
        interactionDetails: cimdInteractionDetails,
        cimdOrganizationId: 'org_id',
      })
    ).rejects.toThrow('write failed');
    expect(provider.interactionResult).not.toHaveBeenCalled();
  });
});
