import { accountCenterSections } from './constants';

it('shows an independent trusted-device permission under session management', () => {
  const accountSecuritySection = accountCenterSections.find(({ key }) => key === 'accountSecurity');
  const sessionManagementGroup = accountSecuritySection?.groups.find(
    ({ key }) => key === 'sessionManagement'
  );

  expect(sessionManagementGroup?.items.map(({ key }) => key)).toEqual(['session', 'trustedDevice']);
});
