import { UserScope } from '@logto/core-kit';
import { AccountCenterControlValue, type TrustedDevice } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import { createMockTrustedDevice, mockUser } from '#src/__mocks__/index.js';
import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import koaErrorHandler from '#src/middleware/koa-error-handler.js';
import koaI18next from '#src/middleware/koa-i18next.js';
import type Libraries from '#src/tenants/Libraries.js';
import type Queries from '#src/tenants/Queries.js';
import { MockTenant, type Partial2 } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const assertFirstPartyClient = jest.fn(async () => true);
jest.unstable_mockModule('#src/utils/assert-first-party-client.js', () => ({
  assertFirstPartyClient,
}));

const trustedDeviceId = 'trusteddeviceid';
const otherTrustedDeviceId = 'othertrusteddeviceid';
const trustedDevice: TrustedDevice = createMockTrustedDevice({
  id: trustedDeviceId,
  userId: mockUser.id,
  userAgent: 'Mozilla/5.0 test browser',
  ip: '192.0.2.1',
  country: 'US',
  city: 'San Francisco',
  createdAt: 1000,
  lastUsedAt: 2000,
  expiresAt: 3000,
});
const otherTrustedDevice: TrustedDevice = {
  ...trustedDevice,
  id: otherTrustedDeviceId,
};

const findActiveByUserId = jest.fn(
  async (): Promise<readonly TrustedDevice[]> => [trustedDevice, otherTrustedDevice]
);
const validateCredential = jest.fn(async (): Promise<TrustedDevice | undefined> => trustedDevice);
const deleteByIdAndUserId = jest.fn(async (): Promise<TrustedDevice | undefined> => trustedDevice);
const clearCredential = jest.fn();

const mockedQueries = {
  trustedDevices: { findActiveByUserId },
} satisfies Partial2<Queries>;

const mockedLibraries = {
  trustedDevices: { validateCredential, deleteByIdAndUserId, clearCredential },
} satisfies Partial2<Libraries>;

const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;
const setDevFeaturesEnabled = (isDevFeaturesEnabled: boolean) => {
  // eslint-disable-next-line @silverhand/fp/no-mutation -- Tests cover route registration in both feature states.
  (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = isDevFeaturesEnabled;
};

const trustedDeviceRoutes = await pickDefault(import('./trusted-device.js'));

const buildRequester = ({
  field = AccountCenterControlValue.Edit,
  identityVerified = true,
  scopes = new Set([UserScope.TrustedDevices]),
  clientId,
  isDevFeaturesEnabled = true,
}: {
  field?: AccountCenterControlValue;
  identityVerified?: boolean;
  scopes?: Set<string>;
  clientId?: string;
  isDevFeaturesEnabled?: boolean;
} = {}) => {
  setDevFeaturesEnabled(isDevFeaturesEnabled);

  return createRequester({
    middlewares: [koaI18next(), koaErrorHandler()],
    authedRoutes: [
      (router) => {
        router.use(async (ctx, next) => {
          ctx.auth = {
            ...ctx.auth,
            id: mockUser.id,
            identityVerified,
            scopes,
            clientId,
          };
          ctx.accountCenter = {
            enabled: true,
            fields: { trustedDevice: field },
          };
          ctx.appendDataHookContext = jest.fn();

          return next();
        });
      },
      trustedDeviceRoutes as never,
    ],
    tenantContext: new MockTenant(undefined, mockedQueries, undefined, mockedLibraries),
  });
};

describe('account trusted device routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
    validateCredential.mockResolvedValue(trustedDevice);
    deleteByIdAndUserId.mockResolvedValue(trustedDevice);
    setDevFeaturesEnabled(originalIsDevFeaturesEnabled);
  });

  it('returns all redacted devices and marks only the validated credential as current', async () => {
    const response = await buildRequester({ field: AccountCenterControlValue.ReadOnly }).get(
      '/my-account/trusted-devices'
    );

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
        isCurrent: true,
      },
      {
        id: otherTrustedDevice.id,
        userAgent: otherTrustedDevice.userAgent,
        country: otherTrustedDevice.country,
        city: otherTrustedDevice.city,
        createdAt: otherTrustedDevice.createdAt,
        lastUsedAt: otherTrustedDevice.lastUsedAt,
        expiresAt: otherTrustedDevice.expiresAt,
        isCurrent: false,
      },
    ]);
    expect(response.text).not.toContain('secretHash');
    expect(response.text).not.toContain(trustedDevice.ip);
    expect(validateCredential).toHaveBeenCalledWith(expect.any(Object), mockUser.id);
    expect(findActiveByUserId).toHaveBeenCalledWith(mockUser.id);
  });

  it('does not infer the current device from a record ID when credential validation fails', async () => {
    // eslint-disable-next-line unicorn/no-useless-undefined -- Jest requires an explicit resolved value for this typed mock.
    validateCredential.mockResolvedValueOnce(undefined);

    const response = await buildRequester().get('/my-account/trusted-devices');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      expect.objectContaining({ id: trustedDeviceId, isCurrent: false }),
      expect.objectContaining({ id: otherTrustedDeviceId, isCurrent: false }),
    ]);
  });

  it.each([
    {
      name: 'identity is not verified',
      options: { identityVerified: false },
      code: 'verification_record.permission_denied',
    },
    {
      name: 'trusted-devices scope is missing',
      options: { scopes: new Set<string>() },
      code: 'auth.unauthorized',
    },
    {
      name: 'trusted-device permission is off',
      options: { field: AccountCenterControlValue.Off },
      code: 'account_center.field_not_enabled',
    },
  ])('rejects GET when $name', async ({ options, code }) => {
    const response = await buildRequester(options).get('/my-account/trusted-devices');

    expect(response.status).toBe(code === 'account_center.field_not_enabled' ? 400 : 401);
    expect(response.body).toHaveProperty('code', code);
    expect(findActiveByUserId).not.toHaveBeenCalled();
  });

  it('deletes an owned remote device without clearing the current credential', async () => {
    deleteByIdAndUserId.mockResolvedValueOnce(otherTrustedDevice);

    const response = await buildRequester().delete(
      `/my-account/trusted-devices/${otherTrustedDeviceId}`
    );

    expect(response.status).toBe(204);
    expect(deleteByIdAndUserId).toHaveBeenCalledWith(
      expect.any(Object),
      otherTrustedDeviceId,
      mockUser.id
    );
    expect(clearCredential).not.toHaveBeenCalled();
  });

  it('clears the trusted-device cookie when deleting the current device', async () => {
    const response = await buildRequester().delete(
      `/my-account/trusted-devices/${trustedDeviceId}`
    );

    expect(response.status).toBe(204);
    expect(clearCredential).toHaveBeenCalledWith(expect.any(Object), mockUser.id);
  });

  it('rejects DELETE for read-only permission', async () => {
    const response = await buildRequester({ field: AccountCenterControlValue.ReadOnly }).delete(
      `/my-account/trusted-devices/${trustedDeviceId}`
    );

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('code', 'account_center.field_not_editable');
    expect(deleteByIdAndUserId).not.toHaveBeenCalled();
  });

  it('rejects DELETE from a third-party application', async () => {
    assertFirstPartyClient.mockRejectedValueOnce(
      new RequestError({ code: 'auth.third_party_application_forbidden', status: 403 })
    );

    const response = await buildRequester({ clientId: 'third-party-application' }).delete(
      `/my-account/trusted-devices/${trustedDeviceId}`
    );

    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('code', 'auth.third_party_application_forbidden');
    expect(deleteByIdAndUserId).not.toHaveBeenCalled();
  });

  it('returns 404 for a missing or non-owned trusted device', async () => {
    // eslint-disable-next-line unicorn/no-useless-undefined -- Jest requires an explicit resolved value for this typed mock.
    deleteByIdAndUserId.mockResolvedValueOnce(undefined);

    const response = await buildRequester().delete('/my-account/trusted-devices/nonowned');

    expect(response.status).toBe(404);
    expect(clearCredential).not.toHaveBeenCalled();
  });

  it('does not register the routes when dev features are disabled', async () => {
    const response = await buildRequester({ isDevFeaturesEnabled: false }).get(
      '/my-account/trusted-devices'
    );

    expect(response.status).toBe(404);
    expect(validateCredential).not.toHaveBeenCalled();
    expect(findActiveByUserId).not.toHaveBeenCalled();
  });
});
