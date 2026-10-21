const mockIsDevFeaturesEnabled = jest.fn(() => true);

jest.mock('@/consts/env', () => ({
  get isDevFeaturesEnabled() {
    return mockIsDevFeaturesEnabled();
  },
}));

const getAccountSecurityGroups = async () => {
  const { accountCenterSections } = await import('./constants');
  const accountSecuritySection = accountCenterSections.find(({ key }) => key === 'accountSecurity');

  return accountSecuritySection?.groups ?? [];
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
    const groups = await getAccountSecurityGroups();
    const sessionManagementGroup = groups.find(({ key }) => key === 'sessionManagement');

    expect(sessionManagementGroup?.items.map(({ key }) => key)).toEqual([
      'session',
      'trustedDevice',
    ]);
  });

  it('shows the personal access token permission under developer settings', async () => {
    const groups = await getAccountSecurityGroups();
    const developerSettingsGroup = groups.find(({ key }) => key === 'developerSettings');

    expect(developerSettingsGroup?.items).toEqual([
      {
        key: 'personalAccessToken',
        title: 'sign_in_exp.account_center.fields.personal_access_tokens',
        description: 'sign_in_exp.account_center.fields.personal_access_tokens_description',
      },
    ]);
  });

  it('hides the personal access token permission when dev features are disabled', async () => {
    mockIsDevFeaturesEnabled.mockReturnValue(false);

    const groups = await getAccountSecurityGroups();

    expect(groups.map(({ key }) => key)).not.toContain('developerSettings');
  });
});
