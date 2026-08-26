import { type TrustedDevice } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import { createMockTrustedDevice, mockUser } from '#src/__mocks__/index.js';
import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { koaManagementApiHooks } from '#src/middleware/koa-management-api-hooks.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import { MockTenant, type Partial2 } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const userId = mockUser.id;
const trustedDeviceId = 'device-id';
const trustedDevice: TrustedDevice = createMockTrustedDevice({
  id: trustedDeviceId,
  userId,
  userAgent: 'Mozilla/5.0 test browser',
  ip: '192.0.2.1',
  country: 'US',
  city: 'San Francisco',
  createdAt: 1000,
  lastUsedAt: 2000,
  expiresAt: 3000,
});

const mockedQueries = {
  users: {
    findUserById: jest.fn(async () => mockUser),
  },
  trustedDevices: {
    findActiveByUserId: jest.fn(async (): Promise<readonly TrustedDevice[]> => [trustedDevice]),
    deleteByIdAndUserId: jest.fn(async (): Promise<TrustedDevice> => trustedDevice),
  },
} satisfies Partial2<Queries>;

const mockedLibraries = {
  trustedDevices: {
    deleteByIdAndUserId: jest.fn(async (): Promise<TrustedDevice | undefined> => trustedDevice),
  },
} satisfies Partial2<Libraries>;

const { findUserById } = mockedQueries.users;
const { findActiveByUserId, deleteByIdAndUserId: deleteTrustedDeviceRecordByIdAndUserId } =
  mockedQueries.trustedDevices;
const { deleteByIdAndUserId } = mockedLibraries.trustedDevices;

const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;

const setDevFeaturesEnabled = (isDevFeaturesEnabled: boolean) => {
  // eslint-disable-next-line @silverhand/fp/no-mutation -- Tests cover route registration in both feature states.
  (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = isDevFeaturesEnabled;
};

const adminUserTrustedDeviceRoutes = await pickDefault(import('./trusted-device.js'));

const createTrustedDeviceRequester = (isDevFeaturesEnabled = true) => {
  setDevFeaturesEnabled(isDevFeaturesEnabled);

  return createRequester({
    authedRoutes: adminUserTrustedDeviceRoutes,
    tenantContext: new MockTenant(undefined, mockedQueries, undefined, mockedLibraries),
  });
};

describe('admin user trusted device routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
    setDevFeaturesEnabled(originalIsDevFeaturesEnabled);
  });

  it('returns all active trusted devices with sensitive fields redacted', async () => {
    const response = await createTrustedDeviceRequester().get(`/users/${userId}/trusted-devices`);

    expect(response.status).toBe(200);
    expect(response.headers['total-number']).toBeUndefined();
    expect(response.headers.link).toBeUndefined();
    expect(response.body).toEqual([
      {
        id: trustedDevice.id,
        userAgent: trustedDevice.userAgent,
        country: trustedDevice.country,
        city: trustedDevice.city,
        createdAt: trustedDevice.createdAt,
        lastUsedAt: trustedDevice.lastUsedAt,
        expiresAt: trustedDevice.expiresAt,
      },
    ]);
    expect(response.text).not.toContain('secretHash');
    expect(response.text).not.toContain(trustedDevice.ip);
    expect(findUserById).toHaveBeenCalledWith(userId);
    expect(findActiveByUserId).toHaveBeenCalledWith(userId);
  });

  it('returns 404 without querying devices when the user does not exist', async () => {
    findUserById.mockRejectedValueOnce(new RequestError({ code: 'entity.not_found', status: 404 }));

    const response = await createTrustedDeviceRequester().get(`/users/${userId}/trusted-devices`);

    expect(response.status).toBe(404);
    expect(findActiveByUserId).not.toHaveBeenCalled();
  });

  it('deletes an owned trusted device through the shared lifecycle library', async () => {
    const response = await createTrustedDeviceRequester().delete(
      `/users/${userId}/trusted-devices/${trustedDeviceId}`
    );

    expect(response.status).toBe(204);
    expect(findUserById).toHaveBeenCalledWith(userId);
    expect(deleteByIdAndUserId).toHaveBeenCalledWith(expect.any(Object), trustedDeviceId, userId, {
      path: `/users/${userId}/trusted-devices/${trustedDeviceId}`,
      method: 'DELETE',
      status: 204,
      params: { userId, trustedDeviceId },
      matchedRoute: '/users/:userId/trusted-devices/:trustedDeviceId',
    });
  });

  it('appends the deletion hook with Management API context', async () => {
    const triggerDataHooks = jest.fn();
    const tenantContext = new MockTenant(undefined, mockedQueries, undefined, {
      hooks: { triggerDataHooks },
    });
    const requester = createRequester({
      middlewares: [koaManagementApiHooks(tenantContext.libraries.hooks)],
      authedRoutes: adminUserTrustedDeviceRoutes,
      tenantContext,
    });

    const response = await requester.delete(`/users/${userId}/trusted-devices/${trustedDeviceId}`);

    expect(response.status).toBe(204);
    expect(deleteTrustedDeviceRecordByIdAndUserId).toHaveBeenCalledWith(trustedDeviceId, userId);
    expect(triggerDataHooks).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        dataHookContextArray: [
          {
            event: 'TrustedDevice.Deleted',
            path: `/users/${userId}/trusted-devices/${trustedDeviceId}`,
            method: 'DELETE',
            status: 204,
            params: { userId, trustedDeviceId },
            matchedRoute: '/users/:userId/trusted-devices/:trustedDeviceId',
            data: {
              id: trustedDeviceId,
              userId,
              expiresAt: trustedDevice.expiresAt,
            },
            includeRequestIp: false,
          },
        ],
      })
    );
  });

  it('returns 404 when the trusted device is missing or belongs to another user', async () => {
    // eslint-disable-next-line unicorn/no-useless-undefined -- Jest requires an explicit resolved value for this typed mock.
    deleteByIdAndUserId.mockResolvedValueOnce(undefined);

    const response = await createTrustedDeviceRequester().delete(
      `/users/${userId}/trusted-devices/${trustedDeviceId}`
    );

    expect(response.status).toBe(404);
  });

  it('returns 404 without deleting when the user does not exist', async () => {
    findUserById.mockRejectedValueOnce(new RequestError({ code: 'entity.not_found', status: 404 }));

    const response = await createTrustedDeviceRequester().delete(
      `/users/${userId}/trusted-devices/${trustedDeviceId}`
    );

    expect(response.status).toBe(404);
    expect(deleteByIdAndUserId).not.toHaveBeenCalled();
  });

  it('does not register the routes when dev features are disabled', async () => {
    const response = await createTrustedDeviceRequester(false).get(
      `/users/${userId}/trusted-devices`
    );

    expect(response.status).toBe(404);
    expect(findUserById).not.toHaveBeenCalled();
  });
});
