import type { Application } from '@logto/schemas';
import snakecaseKeys from 'snakecase-keys';

import { mockApplication } from '@/__mocks__';
import {
  consumeInstanceById,
  destroyInstanceById,
  findPayloadById,
  findPayloadByPayloadField,
  revokeInstanceByGrantId,
  upsertInstance,
} from '@/queries/oidc-model-instance';

import postgresAdapter from './adapter';
import { getConstantClientMetadata } from './utils';

jest.mock('@/queries/application', () => ({
  findApplicationById: jest.fn(async (): Promise<Application> => mockApplication),
}));

jest.mock('@/queries/oidc-model-instance', () => ({
  upsertInstance: jest.fn(),
  findPayloadById: jest.fn(),
  findPayloadByPayloadField: jest.fn(),
  consumeInstanceById: jest.fn(),
  destroyInstanceById: jest.fn(),
  revokeInstanceByGrantId: jest.fn(),
}));

jest.mock('@logto/shared', () => ({
  // eslint-disable-next-line unicorn/consistent-function-scoping
  buildIdGenerator: jest.fn(() => () => 'randomId'),
}));

const now = Date.now();

jest.mock(
  'dayjs',
  // eslint-disable-next-line unicorn/consistent-function-scoping
  jest.fn(() => () => ({
    add: jest.fn((delta: number) => new Date(now + delta * 1000)),
  }))
);

describe('postgres Adapter', () => {
  it('Client Modal', async () => {
    const rejectError = new Error('Not implemented');
    const adapter = postgresAdapter('Client');

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
      ...getConstantClientMetadata(type),
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
    const adapter = postgresAdapter(modelName);

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
});
