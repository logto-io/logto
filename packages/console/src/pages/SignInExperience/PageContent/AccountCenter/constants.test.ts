const mockIsDevFeaturesEnabled = jest.fn(() => true);

jest.mock('@/consts/env', () => ({
  get isDevFeaturesEnabled() {
    return mockIsDevFeaturesEnabled();
  },
}));

const getSessionManagementFieldKeys = async () => {
  const { accountCenterSections } = await import('./constants');
  const accountSecuritySection = accountCenterSections.find(({ key }) => key === 'accountSecurity');
  const sessionManagementGroup = accountSecuritySection?.groups.find(
    ({ key }) => key === 'sessionManagement'
  );

  return sessionManagementGroup?.items.map(({ key }) => key);
};

describe('Account Center field sections', () => {
  beforeEach(() => {
    mockIsDevFeaturesEnabled.mockReturnValue(true);
  });

  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('shows an independent trusted-device permission under session management', async () => {
    await expect(getSessionManagementFieldKeys()).resolves.toEqual(['session', 'trustedDevice']);
  });

  it('hides the trusted-device permission when dev features are disabled', async () => {
    mockIsDevFeaturesEnabled.mockReturnValue(false);

    await expect(getSessionManagementFieldKeys()).resolves.toEqual(['session']);
  });
});
