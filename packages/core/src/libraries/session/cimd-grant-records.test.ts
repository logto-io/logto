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
const grantDestroy = jest.fn(async () => {
  await Promise.resolve();
});

class Grant extends GrantMock {
  static async find(id: string) {
    return id === 'exists' ? existGrant : undefined;
  }

  id: string;

  accountId?: string;

  destroy: () => Promise<void>;

  constructor() {
    super();
    this.id = generateStandardId();
    this.save = async () => grantSave(this.id);
    this.destroy = grantDestroy;
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
      findLatestByClientId: jest.fn(),
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

  const reusedGrantInteractionDetails = {
    ...cimdInteractionDetails,
    grantId: 'exists',
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

  const runConsent = async (
    provider: Provider,
    interactionDetails: Interaction,
    cimdOrganizationId?: string
  ) =>
    consent({
      ctx: context,
      provider,
      envSet: cimdEnvSet,
      queries,
      interactionDetails,
      cimdOrganizationId,
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
    await runConsent(provider, cimdInteractionDetails);

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

  it('should occupy the organization binding before writing the client snapshot', async () => {
    const provider = createCimdProvider(cimdInteractionDetails);
    await runConsent(provider, cimdInteractionDetails, 'org_id');

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
    expect(insertGrantOrganization.mock.invocationCallOrder[0]).toBeLessThan(
      insertGrantClientSnapshot.mock.invocationCallOrder[0] ?? 0
    );
  });

  it('should leave an absent client name and logo unset for the insert to store null', async () => {
    findClient.mockResolvedValueOnce({});
    const provider = createCimdProvider(cimdInteractionDetails);
    await runConsent(provider, cimdInteractionDetails);

    expect(insertGrantClientSnapshot).toHaveBeenCalledWith({
      grantId: grantSave.mock.calls[0]?.[0],
      clientId: cimdClientId,
      name: undefined,
      logoUri: undefined,
    });
  });

  it('should truncate an overlong client name to the column bound', async () => {
    findClient.mockResolvedValueOnce({ clientName: 'a'.repeat(300) });
    const provider = createCimdProvider(cimdInteractionDetails);
    await runConsent(provider, cimdInteractionDetails);

    expect(insertGrantClientSnapshot).toHaveBeenCalledWith({
      grantId: grantSave.mock.calls[0]?.[0],
      clientId: cimdClientId,
      name: 'a'.repeat(256),
      logoUri: undefined,
    });
  });

  it('should keep a client name that fits the column in characters but not in code units', async () => {
    findClient.mockResolvedValueOnce({ clientName: `${'a'.repeat(255)}😀` });
    const provider = createCimdProvider(cimdInteractionDetails);
    await runConsent(provider, cimdInteractionDetails);

    expect(insertGrantClientSnapshot).toHaveBeenCalledWith({
      grantId: grantSave.mock.calls[0]?.[0],
      clientId: cimdClientId,
      name: `${'a'.repeat(255)}😀`,
      logoUri: undefined,
    });
  });

  it('should truncate at a character boundary without splitting a surrogate pair', async () => {
    findClient.mockResolvedValueOnce({ clientName: `${'a'.repeat(256)}😀` });
    const provider = createCimdProvider(cimdInteractionDetails);
    await runConsent(provider, cimdInteractionDetails);

    expect(insertGrantClientSnapshot).toHaveBeenCalledWith({
      grantId: grantSave.mock.calls[0]?.[0],
      clientId: cimdClientId,
      name: 'a'.repeat(256),
      logoUri: undefined,
    });
  });

  it('should drop an overlong logo uri instead of truncating it', async () => {
    findClient.mockResolvedValueOnce({
      clientName: 'Example App',
      logoUri: `https://client.example.com/${'a'.repeat(2048)}.png`,
    });
    const provider = createCimdProvider(cimdInteractionDetails);
    await runConsent(provider, cimdInteractionDetails);

    expect(insertGrantClientSnapshot).toHaveBeenCalledWith({
      grantId: grantSave.mock.calls[0]?.[0],
      clientId: cimdClientId,
      name: 'Example App',
      logoUri: undefined,
    });
  });

  it('should keep a logo uri that fits the column in characters but not in code units', async () => {
    const logoUri = `https://client.example.com/${'😀'.repeat(1015)}.png`;
    findClient.mockResolvedValueOnce({ clientName: 'Example App', logoUri });
    const provider = createCimdProvider(cimdInteractionDetails);
    await runConsent(provider, cimdInteractionDetails);

    expect(insertGrantClientSnapshot).toHaveBeenCalledWith({
      grantId: grantSave.mock.calls[0]?.[0],
      clientId: cimdClientId,
      name: 'Example App',
      logoUri,
    });
  });

  it('should fail the consent and destroy the fresh grant when the client can no longer be resolved', async () => {
    // eslint-disable-next-line unicorn/no-useless-undefined -- undefined is the provider's not-found result under test
    findClient.mockResolvedValueOnce(undefined);
    const provider = createCimdProvider(cimdInteractionDetails);

    await expect(runConsent(provider, cimdInteractionDetails)).rejects.toMatchError(
      new errors.InvalidClient('client must be available')
    );
    expect(insertGrantClientSnapshot).not.toHaveBeenCalled();
    expect(grantDestroy).toHaveBeenCalled();
    expect(provider.interactionResult).not.toHaveBeenCalled();
  });

  it('should fail the consent and destroy the fresh grant when the snapshot write fails', async () => {
    insertGrantClientSnapshot.mockRejectedValueOnce(new Error('write failed'));
    const provider = createCimdProvider(cimdInteractionDetails);

    await expect(runConsent(provider, cimdInteractionDetails)).rejects.toThrow('write failed');
    expect(grantDestroy).toHaveBeenCalled();
    expect(provider.interactionResult).not.toHaveBeenCalled();
  });

  it('should keep the write failure as the surfaced error when the grant cleanup also fails', async () => {
    insertGrantClientSnapshot.mockRejectedValueOnce(new Error('write failed'));
    grantDestroy.mockRejectedValueOnce(new Error('destroy failed'));
    const provider = createCimdProvider(cimdInteractionDetails);

    await expect(runConsent(provider, cimdInteractionDetails)).rejects.toThrow('write failed');
    expect(grantDestroy).toHaveBeenCalled();
    expect(provider.interactionResult).not.toHaveBeenCalled();
  });

  it('should reject a conflicting organization without writing a snapshot and destroy the fresh grant', async () => {
    findGrantOrganizationIds.mockResolvedValueOnce(['other_org_id']);
    const provider = createCimdProvider(cimdInteractionDetails);

    await expect(runConsent(provider, cimdInteractionDetails, 'org_id')).rejects.toMatchError(
      new errors.InvalidRequest(
        'the grant organization binding does not match the submitted organization'
      )
    );
    expect(insertGrantClientSnapshot).not.toHaveBeenCalled();
    expect(grantDestroy).toHaveBeenCalled();
    expect(provider.interactionResult).not.toHaveBeenCalled();
  });

  it('should fail the consent when the organization binding is missing after the write', async () => {
    findGrantOrganizationIds.mockResolvedValueOnce([]);
    const provider = createCimdProvider(cimdInteractionDetails);

    await expect(runConsent(provider, cimdInteractionDetails, 'org_id')).rejects.toMatchError(
      new errors.InvalidRequest(
        'the grant organization binding does not match the submitted organization'
      )
    );
    expect(insertGrantClientSnapshot).not.toHaveBeenCalled();
    expect(grantDestroy).toHaveBeenCalled();
    expect(provider.interactionResult).not.toHaveBeenCalled();
  });

  it('should fail the consent and destroy the fresh grant when the organization row write fails', async () => {
    insertGrantOrganization.mockRejectedValueOnce(new Error('write failed'));
    const provider = createCimdProvider(cimdInteractionDetails);

    await expect(runConsent(provider, cimdInteractionDetails, 'org_id')).rejects.toThrow(
      'write failed'
    );
    expect(insertGrantClientSnapshot).not.toHaveBeenCalled();
    expect(grantDestroy).toHaveBeenCalled();
    expect(provider.interactionResult).not.toHaveBeenCalled();
  });

  it('should re-write the client snapshot without failing when a retried submission reuses the grant', async () => {
    const provider = createCimdProvider(reusedGrantInteractionDetails);
    await runConsent(provider, reusedGrantInteractionDetails);

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
    const provider = createCimdProvider(reusedGrantInteractionDetails);
    await runConsent(provider, reusedGrantInteractionDetails, 'org_id');

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

  it('should fail before any grant change without destroying a reused grant carrying a different organization', async () => {
    findGrantOrganizationIds.mockResolvedValueOnce(['other_org_id']);
    const provider = createCimdProvider(reusedGrantInteractionDetails);

    await expect(
      runConsent(provider, reusedGrantInteractionDetails, 'org_id')
    ).rejects.toMatchError(
      new errors.InvalidRequest(
        'the grant organization binding does not match the submitted organization'
      )
    );
    expect(insertGrantClientSnapshot).not.toHaveBeenCalled();
    expect(grantSave).not.toHaveBeenCalled();
    expect(grantDestroy).not.toHaveBeenCalled();
    expect(provider.interactionResult).not.toHaveBeenCalled();
  });
});
