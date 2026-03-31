import { shouldShowOssCloudSidebarCard } from './oss-cloud-card';

describe('shouldShowOssCloudSidebarCard', () => {
  it('returns true for OSS consoles with dev features enabled when the card has not been dismissed', () => {
    expect(
      shouldShowOssCloudSidebarCard({
        isCloud: false,
        isDevFeaturesEnabled: true,
        isUserPreferencesLoaded: true,
        isDismissed: false,
      })
    ).toBe(true);
  });

  it('returns false for cloud consoles', () => {
    expect(
      shouldShowOssCloudSidebarCard({
        isCloud: true,
        isDevFeaturesEnabled: true,
        isUserPreferencesLoaded: true,
        isDismissed: false,
      })
    ).toBe(false);
  });

  it('returns false when dev features are disabled', () => {
    expect(
      shouldShowOssCloudSidebarCard({
        isCloud: false,
        isDevFeaturesEnabled: false,
        isUserPreferencesLoaded: true,
        isDismissed: false,
      })
    ).toBe(false);
  });

  it('returns false before user preferences are loaded', () => {
    expect(
      shouldShowOssCloudSidebarCard({
        isCloud: false,
        isDevFeaturesEnabled: true,
        isUserPreferencesLoaded: false,
        isDismissed: false,
      })
    ).toBe(false);
  });

  it('returns false after the card is dismissed', () => {
    expect(
      shouldShowOssCloudSidebarCard({
        isCloud: false,
        isDevFeaturesEnabled: true,
        isUserPreferencesLoaded: true,
        isDismissed: true,
      })
    ).toBe(false);
  });
});
