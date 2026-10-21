import { accountStorage } from './session-storage';

describe('accountStorage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('socialFlow persists pending and verified records through explicit entry points', () => {
    const expiresAt = new Date(Date.now() + 60_000).toISOString();

    accountStorage.socialFlow.setPending('google', {
      verificationRecordId: 'pending-id',
      expiresAt,
      state: 'state-123',
      mode: 'add',
    });

    expect(accountStorage.socialFlow.get('google')).toEqual({
      status: 'pending',
      verificationRecordId: 'pending-id',
      expiresAt,
      state: 'state-123',
      mode: 'add',
    });

    accountStorage.socialFlow.setVerified('google', {
      verificationRecordId: 'verified-id',
      expiresAt,
      mode: 'add',
    });

    expect(accountStorage.socialFlow.get('google')).toEqual({
      status: 'verified',
      verificationRecordId: 'verified-id',
      expiresAt,
      mode: 'add',
    });
  });

  it('socialFlow removes expired records', () => {
    accountStorage.socialFlow.setPending('google', {
      verificationRecordId: 'expired-id',
      expiresAt: new Date(Date.now() - 60_000).toISOString(),
      state: 'expired-state',
      mode: 'add',
    });

    expect(accountStorage.socialFlow.get('google')).toBeUndefined();
  });

  it('socialFlow defaults legacy records without mode to add', () => {
    const expiresAt = new Date(Date.now() + 60_000).toISOString();
    sessionStorage.setItem(
      'logto:account-center:social-verification:google',
      JSON.stringify({
        status: 'pending',
        verificationRecordId: 'legacy-pending-id',
        expiresAt,
        state: 'state-123',
      })
    );

    expect(accountStorage.socialFlow.get('google')).toEqual({
      status: 'pending',
      verificationRecordId: 'legacy-pending-id',
      expiresAt,
      state: 'state-123',
      mode: 'add',
    });
  });

  it('routeRestore expires after ttl window', () => {
    const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(0);
    accountStorage.routeRestore.set('/account/password');
    expect(accountStorage.routeRestore.get()).toBe('/account/password');

    dateNowSpy.mockReturnValue(10 * 60 * 1000 + 1);
    expect(accountStorage.routeRestore.get()).toBeUndefined();
  });

  it('pendingReturn expires after ttl window', () => {
    const dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(0);
    accountStorage.pendingReturn.set('https://example.com/account');
    expect(accountStorage.pendingReturn.get()).toBe('https://example.com/account');

    dateNowSpy.mockReturnValue(10 * 60 * 1000 + 1);
    expect(accountStorage.pendingReturn.get()).toBeUndefined();
  });
});
