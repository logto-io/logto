import { accountCenterApplicationId, type Application } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';
import { appendPath, deduplicate } from '@silverhand/essentials';
import snakecaseKeys from 'snakecase-keys';

import { mockApplication } from '#src/__mocks__/index.js';
import { EnvSet } from '#src/env-set/index.js';
import { getTenantUrls } from '#src/env-set/utils.js';
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
  consumeInstanceById: jest.fn(),
  destroyInstanceById: jest.fn(),
  revokeInstanceByGrantId: jest.fn(),
};
const {
  consumeInstanceById,
  destroyInstanceById,
  findPayloadById,
  findPayloadByPayloadField,
  revokeInstanceByGrantId,
  upsertInstance,
} = oidcModelInstances;

const queries = new MockQueries({
  applications: { findApplicationById: jest.fn(async (): Promise<Application> => mockApplication) },
  oidcModelInstances,
});

const now = Date.now();

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
      ...getConstantClientMetadata(mockEnvSet, type),
      ...snakecaseKeys(oidcClientMetadata),
      ...customClientMetadata,
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
    expect(findPayloadByPayloadField).toBeCalledWith(modelName, 'userCode', userCode);

    jest.clearAllMocks();

    await adapter.findByUid(uid);
    expect(findPayloadByPayloadField).toBeCalledWith(modelName, 'uid', uid);

    await adapter.consume(id);
    expect(consumeInstanceById).toBeCalledWith(modelName, id);

    await adapter.destroy(id);
    expect(destroyInstanceById).toBeCalledWith(modelName, id);

    await adapter.revokeByGrantId(grantId);
    expect(revokeInstanceByGrantId).toBeCalledWith(modelName, grantId);
  });

  it('should include custom endpoint in account center redirect uris', async () => {
    const customEndpoint = new URL('https://auth.izumilife.xyz');
    const endpointGetterSpy = jest
      .spyOn(mockEnvSet, 'endpoint', 'get')
      .mockReturnValue(customEndpoint);

    try {
      const adapter = postgresAdapter(mockEnvSet, queries, 'Client');
      const accountCenterClient = await adapter.find(accountCenterApplicationId);
      expect(accountCenterClient).toBeDefined();

      if (!accountCenterClient) {
        throw new Error('Account center client should exist');
      }

      const expectedUrls = deduplicate([
        ...getTenantUrls(mockEnvSet.tenantId, EnvSet.values).map(String),
        customEndpoint.toString(),
      ]).map((url) => appendPath(new URL(url), '/account').href);

      expect(accountCenterClient.redirect_uris).toEqual(expectedUrls);
      expect(accountCenterClient.post_logout_redirect_uris).toEqual(expectedUrls);
    } finally {
      endpointGetterSpy.mockRestore();
    }
  });
});
