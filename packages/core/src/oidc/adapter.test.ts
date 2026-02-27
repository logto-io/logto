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
