import {
  buildCloudUpsellUrl,
  openCloudUpsell,
  ossUpsellEntries,
  utmParameters,
} from './oss-upsell';

describe('oss upsell helpers', () => {
  const mockWindowOpen = jest.fn<ReturnType<typeof window.open>, Parameters<typeof window.open>>();

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(window, 'open').mockImplementation(mockWindowOpen);
    mockWindowOpen.mockReset();
  });

  it('builds a Cloud upsell URL with the standard UTM parameters', () => {
    const url = new URL(buildCloudUpsellUrl(ossUpsellEntries.getStartedOssCloudBanner));

    expect(url.origin).toBe('https://cloud.logto.io');
    expect(url.pathname).toBe('/');
    expect(url.searchParams.get('utm_source')).toBe(utmParameters.source);
    expect(url.searchParams.get('utm_medium')).toBe(utmParameters.medium);
    expect(url.searchParams.get('utm_campaign')).toBe(utmParameters.campaign);
    expect(url.searchParams.get('utm_content')).toBe('get_started_oss_cloud_banner');
  });

  it('preserves the target path and extra query parameters when building the URL', () => {
    const url = new URL(
      buildCloudUpsellUrl(ossUpsellEntries.tenantSettingsMembersOssUpsell, {
        path: '/to/applications',
        extraQuery: {
          plan: 'pro',
        },
      })
    );

    expect(url.pathname).toBe('/to/applications');
    expect(url.searchParams.get('plan')).toBe('pro');
    expect(url.searchParams.get('utm_content')).toBe('tenant_settings_members_oss_upsell');
  });

  it('opens the UTM-tagged Cloud URL in a new tab', () => {
    const targetUrl = openCloudUpsell({
      entry: ossUpsellEntries.ossSidebarCloudCard,
      path: '/to/applications',
    });

    expect(targetUrl).toContain('utm_source=logto_oss');
    expect(targetUrl).toContain('utm_medium=console');
    expect(targetUrl).toContain('utm_campaign=cloud_upsell');
    expect(targetUrl).toContain('utm_content=oss_sidebar_cloud_card');
    expect(mockWindowOpen).toHaveBeenCalledWith(targetUrl, '_blank', 'noopener,noreferrer');
  });
});
