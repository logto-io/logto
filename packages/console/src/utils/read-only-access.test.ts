import { TenantScope } from '@logto/schemas';

import { getIsReadOnlyAccess, getIsWriteAccessConfirmed } from './read-only-access';

const readOnlyScopes = [TenantScope.ReadData, TenantScope.ReadMember];

describe('getIsReadOnlyAccess', () => {
  it('is read-only on Cloud when the scopes lack write:data', () => {
    expect(getIsReadOnlyAccess({ isCloud: true, scopes: readOnlyScopes })).toBe(true);
  });

  it('is not read-only with write:data', () => {
    expect(
      getIsReadOnlyAccess({ isCloud: true, scopes: [...readOnlyScopes, TenantScope.WriteData] })
    ).toBe(false);
  });

  it('is not read-only while the scopes are unknown', () => {
    expect(getIsReadOnlyAccess({ isCloud: true, scopes: undefined })).toBe(false);
  });

  it('is never read-only outside Cloud', () => {
    expect(getIsReadOnlyAccess({ isCloud: false, scopes: readOnlyScopes })).toBe(false);
  });
});

describe('getIsWriteAccessConfirmed', () => {
  it('is confirmed on Cloud when the scopes include write:data', () => {
    expect(
      getIsWriteAccessConfirmed({
        isCloud: true,
        scopes: [...readOnlyScopes, TenantScope.WriteData],
      })
    ).toBe(true);
  });

  it.each([[undefined], [readOnlyScopes], [[]]])(
    'is not confirmed on Cloud for scopes %j',
    (scopes) => {
      expect(getIsWriteAccessConfirmed({ isCloud: true, scopes })).toBe(false);
    }
  );

  it('is always confirmed outside Cloud', () => {
    expect(getIsWriteAccessConfirmed({ isCloud: false, scopes: undefined })).toBe(true);
  });
});
