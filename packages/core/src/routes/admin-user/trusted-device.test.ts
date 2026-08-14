import { type TrustedDevice, defaultTenantId } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import { mockUser } from '#src/__mocks__/index.js';
import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import { MockTenant, type Partial2 } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

import { getSupplementDocuments } from '../swagger/utils/documents.js';

const { jest } = import.meta;

const userId = mockUser.id;
const trustedDeviceId = 'device-id';
const trustedDevice: TrustedDevice = {
  tenantId: defaultTenantId,
  id: trustedDeviceId,
  userId,
  secretHash: Buffer.alloc(32, 1),
  userAgent: 'Mozilla/5.0 test browser',
  ip: '192.0.2.1',
  country: 'US',
  city: 'San Francisco',
  createdAt: 1000,
  lastUsedAt: 2000,
  expiresAt: 3000,
};

const mockedQueries = {
  users: {
    findUserById: jest.fn(async () => mockUser),
  },
  trustedDevices: {
    findActiveByUserId: jest.fn(
      async (): Promise<[number, readonly TrustedDevice[]]> => [1, [trustedDevice]]
    ),
  },
} satisfies Partial2<Queries>;

const mockedLibraries = {
  trustedDevices: {
    deleteByIdAndUserId: jest.fn(async (): Promise<TrustedDevice | undefined> => trustedDevice),
  },
} satisfies Partial2<Libraries>;

const { findUserById } = mockedQueries.users;
const { findActiveByUserId } = mockedQueries.trustedDevices;
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

  it('returns a paginated and redacted list of active trusted devices', async () => {
    const response = await createTrustedDeviceRequester()
      .get(`/users/${userId}/trusted-devices`)
      .query({ page: 2, page_size: 1 });

    expect(response.status).toBe(200);
    expect(response.headers['total-number']).toBe('1');
    expect(response.headers.link).toContain('rel="first"');
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
    expect(findActiveByUserId).toHaveBeenCalledWith(userId, { limit: 1, offset: 1 });
  });

  it('returns 404 without querying devices when the user does not exist', async () => {
    findUserById.mockRejectedValueOnce(new RequestError({ code: 'entity.not_found', status: 404 }));

    const response = await createTrustedDeviceRequester().get(`/users/${userId}/trusted-devices`);

    expect(response.status).toBe(404);
    expect(findActiveByUserId).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid pagination', async () => {
    const response = await createTrustedDeviceRequester().get(
      `/users/${userId}/trusted-devices?page=0`
    );

    expect(response.status).toBe(400);
    expect(findUserById).not.toHaveBeenCalled();
    expect(findActiveByUserId).not.toHaveBeenCalled();
  });

  it('deletes an owned trusted device through the shared lifecycle library', async () => {
    const response = await createTrustedDeviceRequester().delete(
      `/users/${userId}/trusted-devices/${trustedDeviceId}`
    );

    expect(response.status).toBe(204);
    expect(findUserById).toHaveBeenCalledWith(userId);
    expect(deleteByIdAndUserId).toHaveBeenCalledWith(expect.any(Object), trustedDeviceId, userId);
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

describe('admin user trusted device OpenAPI', () => {
  afterEach(() => {
    setDevFeaturesEnabled(originalIsDevFeaturesEnabled);
  });

  it('filters trusted-device operations when dev features are disabled', async () => {
    setDevFeaturesEnabled(false);

    const documents = await getSupplementDocuments('admin-user');

    expect(JSON.stringify(documents)).not.toContain('/api/users/{userId}/trusted-devices');
  });

  it('keeps trusted-device operations when dev features are enabled', async () => {
    setDevFeaturesEnabled(true);

    const documents = await getSupplementDocuments('admin-user');

    expect(JSON.stringify(documents)).toContain('/api/users/{userId}/trusted-devices');
  });
});
