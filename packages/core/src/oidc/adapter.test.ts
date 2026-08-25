import { accountCenterApplicationId, demoAppApplicationId, type Application } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';
import snakecaseKeys from 'snakecase-keys';

import { mockApplication } from '#src/__mocks__/index.js';
import type { EnvSet } from '#src/env-set/index.js';
import { mockEnvSet } from '#src/test-utils/env-set.js';
import { MockQueries } from '#src/test-utils/tenant.js';

import { getConstantClientMetadata } from './utils.js';

const { jest } = import.meta;

const { mockEsm } = createMockUtils(jest);

mockEsm(
  'date-fns',
  jest.fn(() => ({
    addSeconds: jest.fn((_: Date, seconds: number) => new Date(now + seconds * 1000)),
  }))
);

const { default: postgresAdapter } = await import('./adapter.js');

const oidcModelInstances = {
  upsertInstance: jest.fn(),
  findPayloadById: jest.fn(),
  findPayloadByPayloadField: jest.fn(),
  findPayloadByUid: jest.fn(),
  findPayloadByUserCode: jest.fn(),
  consumeInstanceById: jest.fn(),
  destroyInstanceById: jest.fn(),
  revokeInstanceByGrantId: jest.fn(),
};
const {
  consumeInstanceById,
  destroyInstanceById,
  findPayloadById,
  findPayloadByUid,
  findPayloadByUserCode,
  revokeInstanceByGrantId,
  upsertInstance,
} = oidcModelInstances;

const queries = new MockQueries({
  applications: { findApplicationById: jest.fn(async (): Promise<Application> => mockApplication) },
  oidcModelInstances,
});

const now = Date.now();
const mockBuiltInAppEnvSet = (customDomain: string): EnvSet =>
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  ({
    tenantId: mockEnvSet.tenantId,
    oidc: mockEnvSet.oidc,
    endpoint: new URL(customDomain),
  }) as EnvSet;

describe('postgres Adapter', () => {
  it('Client Modal', async () => {
    const rejectError = new Error('Not implemented');
    const adapter = postgresAdapter(mockEnvSet, queries, 'Client');

    await expect(adapter.upsert('client', {}, 0)).rejects.toMatchError(rejectError);
    await expect(adapter.findByUserCode('foo')).rejects.toMatchError(rejectError);
    await expect(adapter.findByUid('foo')).rejects.toMatchError(rejectError);
    await expect(adapter.consume('foo')).rejects.toMatchError(rejectError);
    await expect(adapter.destroy('foo')).rejects.toMatchError(rejectError);
    await expect(adapter.revokeByGrantId('foo')).rejects.toMatchError(rejectError);

    const application = await adapter.find('foo');

    const {
      id: client_id,
      name: client_name,
      secret: client_secret,
      type,
      oidcClientMetadata,
      customClientMetadata,
    } = mockApplication;

    expect(application).toEqual({
      client_id,
      client_name,
      client_secret,
      appLevelAccessControlEnabled: mockApplication.appLevelAccessControlEnabled,
      ...getConstantClientMetadata(mockEnvSet, type),
      ...snakecaseKeys(oidcClientMetadata),
      ...customClientMetadata,
    });
  });

  it('includes app-level access-control gate in client metadata', async () => {
    const adapter = postgresAdapter(
      mockEnvSet,
      new MockQueries({
        applications: {
          findApplicationById: jest.fn(
            async (): Promise<Application> => ({
              ...mockApplication,
              appLevelAccessControlEnabled: true,
            })
          ),
        },
      }),
      'Client'
    );

    await expect(adapter.find('foo')).resolves.toMatchObject({
      appLevelAccessControlEnabled: true,
    });
  });

  it('Access Token Model', async () => {
    const modelName = 'Access Token';
    const uid = 'fooUser';
    const userCode = 'fooCode';
    const id = 'fooId';
    const grantId = 'grantId';
    const expireAt = 60;
    const adapter = postgresAdapter(mockEnvSet, queries, modelName);

    await adapter.upsert(id, { uid, userCode }, expireAt);
    expect(upsertInstance).toBeCalledWith({
      modelName,
      id,
      payload: { uid, userCode },
      expiresAt: now + expireAt * 1000,
    });

    await adapter.find(id);
    expect(findPayloadById).toBeCalledWith(modelName, id);

    await adapter.findByUserCode(userCode);
    expect(findPayloadByUserCode).toBeCalledWith(modelName, userCode);

    jest.clearAllMocks();

    await adapter.findByUid(uid);
    expect(findPayloadByUid).toBeCalledWith(modelName, uid);

    await adapter.consume(id);
    expect(consumeInstanceById).toBeCalledWith(modelName, id);

    await adapter.destroy(id);
    expect(destroyInstanceById).toBeCalledWith(modelName, id);

    await adapter.revokeByGrantId(grantId);
    expect(revokeInstanceByGrantId).toBeCalledWith(modelName, grantId);
  });

  it('includes runtime custom-domain redirect URI for Account Center built-in app', async () => {
    const customDomain = 'https://account.custom.test';
    const adapter = postgresAdapter(mockBuiltInAppEnvSet(customDomain), queries, 'Client');

    const application = await adapter.find(accountCenterApplicationId);
    expect(application).toBeDefined();

    expect(application?.redirect_uris).toEqual(expect.arrayContaining([`${customDomain}/account`]));
    expect(application?.post_logout_redirect_uris).toEqual(
      expect.arrayContaining([`${customDomain}/account`])
    );
  });

  it('includes runtime custom-domain redirect URI for Demo App built-in app', async () => {
    const customDomain = 'https://preview.custom.test';
    const adapter = postgresAdapter(mockBuiltInAppEnvSet(customDomain), queries, 'Client');

    const application = await adapter.find(demoAppApplicationId);
    expect(application).toBeDefined();

    expect(application?.redirect_uris).toEqual(
      expect.arrayContaining([`${customDomain}/demo-app`])
    );
    expect(application?.post_logout_redirect_uris).toEqual(
      expect.arrayContaining([`${customDomain}/demo-app`])
    );
  });
});

/**
 * Load the adapter (and its error classes) after resetting the module registry, so the error
 * classes asserted below share the identities of the ones the adapter throws.
 */
const loadClientAdapter = async ({
  isSsrfProtectionEnabled = true,
  cimdEnabled = true,
  findApplicationById,
}: {
  isSsrfProtectionEnabled?: boolean;
  cimdEnabled?: boolean;
  findApplicationById: jest.Mock;
}) => {
  jest.resetModules();
  mockEsm('#src/env-set/index.js', () => ({
    EnvSet: {
      values: { isSsrfProtectionEnabled },
    },
  }));

  /**
   * Sequential imports on purpose: concurrent `import()` calls after `jest.resetModules()`
   * race the ESM linking of the shared dependency graph ("Module status must not be unlinked
   * or linking").
   */
  const { default: loadedAdapter } = await import('./adapter.js');
  const { errors } = await import('oidc-provider');

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- minimal env-set stub scoped to the field the adapter reads
  const envSet = { oidc: { cimdEnabled } } as EnvSet;
  const adapter = loadedAdapter(
    envSet,
    new MockQueries({ applications: { findApplicationById } }),
    'Client'
  );

  return {
    // eslint-disable-next-line unicorn/no-array-callback-reference -- `Adapter#find` is not an array method
    findClient: async (clientId: string) => adapter.find(clientId),
    errors,
  };
};

describe('client adapter `find` fallback contract', () => {
  const registeredClientId = 'some_client_id';
  const cimdClientId = 'https://client.example.com/metadata.json';

  it('resolves a CIMD client ID to undefined without a database lookup while CIMD is effectively enabled', async () => {
    const findApplicationById = jest.fn();
    const { findClient } = await loadClientAdapter({ findApplicationById });

    await expect(findClient(cimdClientId)).resolves.toBeUndefined();
    expect(findApplicationById).not.toHaveBeenCalled();
  });

  it.each([
    ['CIMD is disabled for the tenant', { cimdEnabled: false }],
    ['SSRF protection is off', { isSsrfProtectionEnabled: false }],
  ])('looks a CIMD client ID up as a registered application when %s', async (_, flags) => {
    const findApplicationById = jest.fn().mockRejectedValue(new Error('not found'));
    const { findClient, errors } = await loadClientAdapter({ ...flags, findApplicationById });

    await expect(findClient(cimdClientId)).rejects.toThrow(errors.InvalidClient);
    expect(findApplicationById).toHaveBeenCalledWith(cimdClientId);
  });

  it('folds lookup errors of a registered client ID into invalid_client while CIMD is effectively enabled', async () => {
    const findApplicationById = jest.fn().mockRejectedValue(new Error('connection reset'));
    const { findClient, errors } = await loadClientAdapter({ findApplicationById });

    await expect(findClient(registeredClientId)).rejects.toThrow(errors.InvalidClient);
  });
});
