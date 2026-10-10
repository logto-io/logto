import { TenantScope } from '@logto/schemas';

import { getIsReadOnlyAccess } from './utils';

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
