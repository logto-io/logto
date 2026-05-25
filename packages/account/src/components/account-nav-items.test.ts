import { profileRoute, securityRoute } from '@ac/constants/routes';

import { buildAccountNavItems } from './account-nav-items';

describe('buildAccountNavItems', () => {
  it('returns profile and security items when both are enabled', () => {
    const items = buildAccountNavItems({ hasProfile: true, hasSecurity: true });

    expect(items).toHaveLength(2);
    expect(items[0]?.to).toBe(profileRoute);
    expect(items[1]?.to).toBe(securityRoute);
  });

  it('returns only security when profile is disabled', () => {
    const items = buildAccountNavItems({ hasProfile: false, hasSecurity: true });

    expect(items).toHaveLength(1);
    expect(items[0]?.to).toBe(securityRoute);
  });
});
