import { accountCenterSections } from './constants';

const getAccountSecurityGroups = () =>
  accountCenterSections.find(({ key }) => key === 'accountSecurity')?.groups ?? [];

describe('Account Center field sections', () => {
  it('shows an independent trusted-device permission under session management', () => {
    const groups = getAccountSecurityGroups();
    const sessionManagementGroup = groups.find(({ key }) => key === 'sessionManagement');

    expect(sessionManagementGroup?.items.map(({ key }) => key)).toEqual([
      'session',
      'trustedDevice',
    ]);
  });

  it('shows the personal access token permission under developer settings', () => {
    const groups = getAccountSecurityGroups();
    const developerSettingsGroup = groups.find(({ key }) => key === 'developerSettings');

    expect(developerSettingsGroup?.items).toEqual([
      {
        key: 'personalAccessToken',
        title: 'sign_in_exp.account_center.fields.personal_access_tokens',
        description: 'sign_in_exp.account_center.fields.personal_access_tokens_description',
      },
    ]);
  });
});
