import { shouldShowOssCloudSidebarCard } from './oss-cloud-card';

describe('shouldShowOssCloudSidebarCard', () => {
  const now = 1_000_000;

  it('returns true for OSS consoles with dev features enabled when the card has not been dismissed', () => {
    expect(
      shouldShowOssCloudSidebarCard({
        isCloud: false,
        isDevFeaturesEnabled: true,
        dismissedUntil: undefined,
        now,
      })
    ).toBe(true);
  });

  it('returns false for cloud consoles', () => {
    expect(
      shouldShowOssCloudSidebarCard({
        isCloud: true,
        isDevFeaturesEnabled: true,
        dismissedUntil: undefined,
        now,
      })
    ).toBe(false);
  });

  it('returns false when dev features are disabled', () => {
    expect(
      shouldShowOssCloudSidebarCard({
        isCloud: false,
        isDevFeaturesEnabled: false,
        dismissedUntil: undefined,
        now,
      })
    ).toBe(false);
  });

  it('returns false before the dismissal expires', () => {
    expect(
      shouldShowOssCloudSidebarCard({
        isCloud: false,
        isDevFeaturesEnabled: true,
        dismissedUntil: now + 1,
        now,
      })
    ).toBe(false);
  });

  it('returns true after the dismissal has expired', () => {
    expect(
      shouldShowOssCloudSidebarCard({
        isCloud: false,
        isDevFeaturesEnabled: true,
        dismissedUntil: now - 1,
        now,
      })
    ).toBe(true);
  });

  it('returns true when the dismissal expires exactly at the current time', () => {
    expect(
      shouldShowOssCloudSidebarCard({
        isCloud: false,
        isDevFeaturesEnabled: true,
        dismissedUntil: now,
        now,
      })
    ).toBe(true);
  });
});
