export type AccountIndexPage = 'home' | 'security';

export const getAccountIndexPage = (isDevFeaturesEnabled: boolean): AccountIndexPage =>
  isDevFeaturesEnabled ? 'security' : 'home';
