import {
  AccountCenterControlValue,
  type AccountCenter,
  type AccountCenterFieldControl,
} from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import { EnvSet } from '#src/env-set/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;

const mockAccountCenter = {
  tenantId: 'mock_id',
  id: 'default',
  enabled: true,
  fields: {
    session: AccountCenterControlValue.Edit,
    trustedDevice: AccountCenterControlValue.Edit,
  },
  webauthnRelatedOrigins: [],
  deleteAccountUrl: null,
  customCss: null,
  profileFields: null,
} satisfies AccountCenter;

const accountCentersRoutes = await pickDefault(import('./index.js'));
const wellKnownRoutes = await pickDefault(import('../well-known/index.js'));

const setDevFeaturesEnabled = (isDevFeaturesEnabled: boolean) => {
  // eslint-disable-next-line @silverhand/fp/no-mutation -- Route tests cover both dev-feature states.
  (EnvSet.values as { isDevFeaturesEnabled: boolean }).isDevFeaturesEnabled = isDevFeaturesEnabled;
};

const createTenant = () => {
  const findDefaultAccountCenter = jest.fn(async () => mockAccountCenter);
  const updateDefaultAccountCenter = jest.fn(async ({ fields }: Partial<AccountCenter>) => ({
    ...mockAccountCenter,
    ...(fields && { fields }),
  }));

  return {
    tenant: new MockTenant(
      undefined,
      {
        accountCenters: { findDefaultAccountCenter, updateDefaultAccountCenter },
      },
      undefined,
      {
        customProfileFields: {
          normalizeProfileFields: async (profileFields) => profileFields,
        },
      }
    ),
    updateDefaultAccountCenter,
  };
};

afterEach(() => {
  setDevFeaturesEnabled(originalIsDevFeaturesEnabled);
  jest.clearAllMocks();
});

describe('Account Center API trusted-device field guard', () => {
  it('omits trusted device settings from Management and well-known responses when dev features are disabled', async () => {
    setDevFeaturesEnabled(false);
    const { tenant } = createTenant();
    const managementRequester = createRequester({
      authedRoutes: accountCentersRoutes,
      tenantContext: tenant,
    });
    const wellKnownRequester = createRequester({
      anonymousRoutes: wellKnownRoutes,
      tenantContext: tenant,
    });

    const [managementResponse, wellKnownResponse] = await Promise.all([
      managementRequester.get('/account-center'),
      wellKnownRequester.get('/.well-known/account-center'),
    ]);

    expect(managementResponse.status).toEqual(200);
    expect(managementResponse.body.fields).toEqual({
      session: AccountCenterControlValue.Edit,
    });
    expect(wellKnownResponse.status).toEqual(200);
    expect(wellKnownResponse.body.fields).toEqual({
      session: AccountCenterControlValue.Edit,
    });
  });

  it('ignores trusted device settings in Management API updates when dev features are disabled', async () => {
    setDevFeaturesEnabled(false);
    const { tenant, updateDefaultAccountCenter } = createTenant();
    const requester = createRequester({
      authedRoutes: accountCentersRoutes,
      tenantContext: tenant,
    });

    const response = await requester.patch('/account-center').send({
      fields: {
        session: AccountCenterControlValue.ReadOnly,
        trustedDevice: AccountCenterControlValue.ReadOnly,
      } satisfies AccountCenterFieldControl,
    });

    expect(response.status).toEqual(200);
    expect(updateDefaultAccountCenter).toHaveBeenCalledWith(
      expect.objectContaining({
        fields: { session: AccountCenterControlValue.ReadOnly },
      })
    );
    expect(response.body.fields).toEqual({
      session: AccountCenterControlValue.ReadOnly,
    });
  });

  it('accepts and returns trusted device settings when dev features are enabled', async () => {
    setDevFeaturesEnabled(true);
    const { tenant, updateDefaultAccountCenter } = createTenant();
    const managementRequester = createRequester({
      authedRoutes: accountCentersRoutes,
      tenantContext: tenant,
    });
    const wellKnownRequester = createRequester({
      anonymousRoutes: wellKnownRoutes,
      tenantContext: tenant,
    });

    const updateResponse = await managementRequester.patch('/account-center').send({
      fields: { trustedDevice: AccountCenterControlValue.ReadOnly },
    });
    const wellKnownResponse = await wellKnownRequester.get('/.well-known/account-center');

    expect(updateResponse.status).toEqual(200);
    expect(updateDefaultAccountCenter).toHaveBeenCalledWith(
      expect.objectContaining({
        fields: { trustedDevice: AccountCenterControlValue.ReadOnly },
      })
    );
    expect(updateResponse.body.fields).toEqual({
      trustedDevice: AccountCenterControlValue.ReadOnly,
    });
    expect(wellKnownResponse.status).toEqual(200);
    expect(wellKnownResponse.body.fields.trustedDevice).toEqual(AccountCenterControlValue.Edit);
  });
});
