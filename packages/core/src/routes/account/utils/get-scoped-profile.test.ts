import { AccountCenterControlValue, type AccountCenter } from '@logto/schemas';

import { getAccountCenterFilteredProfile } from './get-scoped-profile.js';

describe('getAccountCenterFilteredProfile', () => {
  const accountCenter: AccountCenter = {
    tenantId: 'tenant-id',
    id: 'default',
    enabled: true,
    fields: {
      email: AccountCenterControlValue.Off,
      phone: AccountCenterControlValue.Off,
    },
    webauthnRelatedOrigins: [],
    deleteAccountUrl: null,
    customCss: null,
    profileFields: null,
    maximumAuthenticationAgeInSeconds: 600,
  };

  it('exposes primary identifier availability without exposing the identifiers', () => {
    const profile = getAccountCenterFilteredProfile({ id: 'user-id' }, accountCenter, {
      passwordEncrypted: null,
      primaryEmail: 'alex@example.com',
      primaryPhone: '+14155550100',
    });

    expect(profile.primaryEmail).toBeUndefined();
    expect(profile.primaryPhone).toBeUndefined();
    expect(profile.hasPrimaryEmail).toBe(true);
    expect(profile.hasPrimaryPhone).toBe(true);
  });

  it('reports missing identifiers as false', () => {
    const profile = getAccountCenterFilteredProfile({ id: 'user-id' }, accountCenter, {
      passwordEncrypted: null,
      primaryEmail: null,
      primaryPhone: null,
    });

    expect(profile.hasPrimaryEmail).toBe(false);
    expect(profile.hasPrimaryPhone).toBe(false);
  });
});
