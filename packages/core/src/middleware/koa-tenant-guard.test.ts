import type router from '@logto/cloud/routes';
import Client from '@withtyped/client';
import Sinon from 'sinon';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { CloudConnectionLibrary } from '#src/libraries/cloud-connection.js';
import { type LogtoConfigLibrary } from '#src/libraries/logto-config.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import koaTenantGuard from './koa-tenant-guard.js';

const { jest } = import.meta;

const logtoConfigs: LogtoConfigLibrary = {
  getCloudConnectionData: jest.fn().mockResolvedValue({
    appId: 'appId',
    appSecret: 'appSecret',
    resource: 'resource',
  }),
  getOidcConfigs: jest.fn(),
};

describe('koaTenantGuard middleware', () => {
  const cloudConnection = new CloudConnectionLibrary(logtoConfigs);
  const mockCloudClient = new Client<typeof router>({ baseUrl: 'http://localhost:3000' });

  const getClientSpy = jest.spyOn(cloudConnection, 'getClient').mockResolvedValue(mockCloudClient);
  const clientGetSpy = jest.spyOn(mockCloudClient, 'get');

  const next = jest.fn();
  const ctx = createContextWithRouteParameters();

  it('should return directly if not in cloud', async () => {
    const stub = Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      isCloud: false,
    });

    await expect(koaTenantGuard(cloudConnection)(ctx, next)).resolves.not.toThrow();
    expect(clientGetSpy).not.toBeCalled();
    expect(getClientSpy).not.toBeCalled();

    stub.restore();
  });

  it('should reject if tenant is suspended', async () => {
    const stub = Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      isCloud: true,
    });

    // @ts-expect-error mock returning value
    clientGetSpy.mockResolvedValue({
      isSuspended: true,
    });

    await expect(koaTenantGuard(cloudConnection)(ctx, next)).rejects.toMatchError(
      new RequestError('subscription.tenant_suspended', 403)
    );

    expect(clientGetSpy).toBeCalledWith('/api/my/tenant');

    stub.restore();
  });

  it('should resolve if tenant is not suspended', async () => {
    const stub = Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      isCloud: true,
    });

    // @ts-expect-error mock returning value
    clientGetSpy.mockResolvedValue({
      isSuspended: false,
    });

    await expect(koaTenantGuard(cloudConnection)(ctx, next)).resolves.not.toThrow();

    expect(clientGetSpy).toBeCalledWith('/api/my/tenant');

    stub.restore();
  });
});
