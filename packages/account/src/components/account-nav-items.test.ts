import { profileRoute, securityRoute, sessionsRoute } from '@ac/constants/routes';

import { buildAccountNavItems } from './account-nav-items';

describe('buildAccountNavItems', () => {
  it('returns profile, security, and sessions items when all are enabled', () => {
    const items = buildAccountNavItems({ hasProfile: true, hasSecurity: true, hasSessions: true });

    expect(items).toHaveLength(3);
    expect(items[0]?.to).toBe(profileRoute);
    expect(items[1]?.to).toBe(securityRoute);
    expect(items[2]?.to).toBe(sessionsRoute);
  });

  it('returns only security when profile and sessions are disabled', () => {
    const items = buildAccountNavItems({
      hasProfile: false,
      hasSecurity: true,
      hasSessions: false,
    });

    expect(items).toHaveLength(1);
    expect(items[0]?.to).toBe(securityRoute);
  });
});
