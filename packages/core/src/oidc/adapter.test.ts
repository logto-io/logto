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

describe('client adapter `find` fallback contract', () => {
  const clientId = 'some_client_id';

  /**
   * Load the adapter (and its error classes) after resetting the module registry, so the
   * `instanceof` checks inside the adapter observe the same class identities as the errors
   * thrown and asserted below.
   */
  const loadClientAdapter = async ({
    isDevFeaturesEnabled = true,
    isOidcProviderSsrfProtectionEnabled = true,
    cimdEnabled = true,
    findApplicationById,
  }: {
    isDevFeaturesEnabled?: boolean;
    isOidcProviderSsrfProtectionEnabled?: boolean;
    cimdEnabled?: boolean;
    findApplicationById: jest.Mock;
  }) => {
    jest.resetModules();
    mockEsm('#src/env-set/index.js', () => ({
      EnvSet: {
        values: { isDevFeaturesEnabled, isOidcProviderSsrfProtectionEnabled },
      },
    }));

    /**
     * Sequential imports on purpose: concurrent `import()` calls after `jest.resetModules()`
     * race the ESM linking of the shared dependency graph ("Module status must not be unlinked
     * or linking").
     */
    const { default: loadedAdapter } = await import('./adapter.js');
    const { default: RequestError } = await import('#src/errors/RequestError/index.js');
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
      findClient: async () => adapter.find(clientId),
      buildNotFoundError: () =>
        new RequestError({
          code: 'entity.not_exists_with_id',
          name: 'applications',
          id: clientId,
          status: 404,
        }),
      errors,
    };
  };

  it('resolves to undefined on a confirmed missing record while CIMD is effectively enabled', async () => {
    const findApplicationById = jest.fn();
    const { findClient, buildNotFoundError } = await loadClientAdapter({ findApplicationById });
    findApplicationById.mockRejectedValue(buildNotFoundError());

    await expect(findClient()).resolves.toBeUndefined();
  });

  it('keeps the invalid_client behavior on a missing record when CIMD is not effectively enabled', async () => {
    const findApplicationById = jest.fn();
    const { findClient, buildNotFoundError, errors } = await loadClientAdapter({
      cimdEnabled: false,
      findApplicationById,
    });
    findApplicationById.mockRejectedValue(buildNotFoundError());

    await expect(findClient()).rejects.toThrow(errors.InvalidClient);
  });

  it('keeps the invalid_client behavior on a missing record when SSRF protection is off', async () => {
    const findApplicationById = jest.fn();
    const { findClient, buildNotFoundError, errors } = await loadClientAdapter({
      isOidcProviderSsrfProtectionEnabled: false,
      findApplicationById,
    });
    findApplicationById.mockRejectedValue(buildNotFoundError());

    await expect(findClient()).rejects.toThrow(errors.InvalidClient);
  });

  it('propagates database errors instead of resolving to undefined while CIMD is effectively enabled', async () => {
    const databaseError = new Error('connection reset');
    const findApplicationById = jest.fn().mockRejectedValue(databaseError);
    const { findClient } = await loadClientAdapter({ findApplicationById });

    await expect(findClient()).rejects.toBe(databaseError);
  });

  it('folds database errors into invalid_client when CIMD is not effectively enabled', async () => {
    const findApplicationById = jest.fn().mockRejectedValue(new Error('connection reset'));
    const { findClient, errors } = await loadClientAdapter({
      cimdEnabled: false,
      findApplicationById,
    });

    await expect(findClient()).rejects.toThrow(errors.InvalidClient);
  });

  it('folds every lookup error into invalid_client when the dev features flag is off', async () => {
    const findApplicationById = jest.fn().mockRejectedValue(new Error('connection reset'));
    const { findClient, errors } = await loadClientAdapter({
      isDevFeaturesEnabled: false,
      findApplicationById,
    });

    await expect(findClient()).rejects.toThrow(errors.InvalidClient);
  });
});
