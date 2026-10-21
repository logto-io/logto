import {
  licenseUsageBannerDismissDuration,
  parseLicenseUsageBannerDismissedUntil,
  shouldShowLicenseUsageBanner,
} from './license-usage-banner';

describe('shouldShowLicenseUsageBanner', () => {
  const now = 1_000_000;
  const base = {
    isCloud: false,
    isLicensePage: false,
    hasUsageWarnings: true,
    now,
  } as const;

  it('shows on a self-hosted deployment with usage warnings', () => {
    expect(shouldShowLicenseUsageBanner(base)).toBe(true);
  });

  it.each([
    { name: 'Cloud', overrides: { isCloud: true } },
    { name: 'the License page', overrides: { isLicensePage: true } },
    { name: 'no usage warnings', overrides: { hasUsageWarnings: false } },
  ])('does not show on $name', ({ overrides }) => {
    expect(shouldShowLicenseUsageBanner({ ...base, ...overrides })).toBe(false);
  });

  it('stays hidden before the dismissal expires', () => {
    expect(shouldShowLicenseUsageBanner({ ...base, dismissedUntil: now + 1 })).toBe(false);
  });

  it('shows again once the dismissal expires', () => {
    expect(shouldShowLicenseUsageBanner({ ...base, dismissedUntil: now })).toBe(true);
  });
});

describe('parseLicenseUsageBannerDismissedUntil', () => {
  it('reads a stored timestamp', () => {
    expect(parseLicenseUsageBannerDismissedUntil('1000')).toBe(1000);
  });

  it.each([undefined, null, '', 'abc', '0'])('treats %p as not dismissed', (value) => {
    expect(parseLicenseUsageBannerDismissedUntil(value)).toBeUndefined();
  });
});

describe('licenseUsageBannerDismissDuration', () => {
  it('is 7 days', () => {
    expect(licenseUsageBannerDismissDuration).toBe(7 * 24 * 60 * 60 * 1000);
  });
});
