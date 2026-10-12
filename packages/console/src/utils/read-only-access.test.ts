import { TenantScope } from '@logto/schemas';

import { getIsReadOnlyAccess, getIsWriteAccessConfirmed } from './read-only-access';

const cloud = { isDevFeaturesEnabled: true, isCloud: true };
const readOnlyScopes = [TenantScope.ReadData, TenantScope.ReadMember];

describe('getIsReadOnlyAccess', () => {
  it('is read-only on Cloud when the scopes lack write:data', () => {
    expect(getIsReadOnlyAccess({ ...cloud, scopes: readOnlyScopes })).toBe(true);
  });

  it('is not read-only with write:data', () => {
    expect(
      getIsReadOnlyAccess({ ...cloud, scopes: [...readOnlyScopes, TenantScope.WriteData] })
    ).toBe(false);
  });

  it('is not read-only while the scopes are unknown', () => {
    expect(getIsReadOnlyAccess({ ...cloud, scopes: undefined })).toBe(false);
  });

  it('is never read-only outside Cloud', () => {
    expect(getIsReadOnlyAccess({ ...cloud, isCloud: false, scopes: readOnlyScopes })).toBe(false);
  });

  it('is never read-only with dev features off', () => {
    expect(
      getIsReadOnlyAccess({ ...cloud, isDevFeaturesEnabled: false, scopes: readOnlyScopes })
    ).toBe(false);
  });
});

describe('getIsWriteAccessConfirmed', () => {
  it('is confirmed on Cloud when the scopes include write:data', () => {
    expect(
      getIsWriteAccessConfirmed({ ...cloud, scopes: [...readOnlyScopes, TenantScope.WriteData] })
    ).toBe(true);
  });

  it.each([[undefined], [readOnlyScopes], [[]]])(
    'is not confirmed on Cloud for scopes %j',
    (scopes) => {
      expect(getIsWriteAccessConfirmed({ ...cloud, scopes })).toBe(false);
    }
  );

  it('is always confirmed outside Cloud', () => {
    expect(getIsWriteAccessConfirmed({ ...cloud, isCloud: false, scopes: undefined })).toBe(true);
  });

  it('is always confirmed with dev features off', () => {
    expect(
      getIsWriteAccessConfirmed({ ...cloud, isDevFeaturesEnabled: false, scopes: undefined })
    ).toBe(true);
  });
});
