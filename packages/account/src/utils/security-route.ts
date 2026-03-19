export type AccountIndexPage = 'home' | 'security';

export const getAccountIndexPage = (
  isDevFeaturesEnabled: boolean,
  isAccountCenterEnabled: boolean
): AccountIndexPage => (isDevFeaturesEnabled && isAccountCenterEnabled ? 'security' : 'home');
