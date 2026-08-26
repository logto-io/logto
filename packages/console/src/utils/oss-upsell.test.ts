import {
  buildCloudUpsellUrl,
  buildSelfHostedPlansUrl,
  openCloudUpsell,
  openSelfHostedPlansUpsell,
  ossUpsellEntries,
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
    expect(url.searchParams.get('utm_source')).toBe('logto_oss');
    expect(url.searchParams.get('utm_medium')).toBe('console');
    expect(url.searchParams.get('utm_campaign')).toBe('cloud_upsell');
    expect(url.searchParams.get('utm_content')).toBe('get_started_oss_cloud_banner');
  });

  it('builds a self-hosted plans URL with a dedicated campaign value', () => {
    const url = new URL(buildSelfHostedPlansUrl(ossUpsellEntries.tenantSettingsMembersOssUpsell));

    expect(url.origin).toBe('https://logto.io');
    expect(url.pathname).toBe('/self-hosted-plans');
    expect(url.searchParams.get('utm_source')).toBe('logto_oss');
    expect(url.searchParams.get('utm_medium')).toBe('console');
    expect(url.searchParams.get('utm_campaign')).toBe('self_hosted_plans');
    expect(url.searchParams.get('utm_content')).toBe('tenant_settings_members_oss_upsell');
  });

  it.each([
    [ossUpsellEntries.ossSidebarCloudCard, 'oss_sidebar_cloud_card'],
    [ossUpsellEntries.getStartedOssCloudBanner, 'get_started_oss_cloud_banner'],
  ])('attributes the %s general upsell surface to self-hosted plans', (entry, content) => {
    const url = new URL(buildSelfHostedPlansUrl(entry));

    expect(url.searchParams.get('utm_campaign')).toBe('self_hosted_plans');
    expect(url.searchParams.get('utm_content')).toBe(content);
  });

  it('opens the UTM-tagged Cloud URL in a new tab', () => {
    const targetUrl = openCloudUpsell({
      entry: ossUpsellEntries.ossSidebarCloudCard,
    });

    expect(targetUrl).toContain('utm_source=logto_oss');
    expect(targetUrl).toContain('utm_medium=console');
    expect(targetUrl).toContain('utm_campaign=cloud_upsell');
    expect(targetUrl).toContain('utm_content=oss_sidebar_cloud_card');
    expect(mockWindowOpen).toHaveBeenCalledWith(targetUrl, '_blank', 'noopener,noreferrer');
  });

  it('opens the UTM-tagged self-hosted plans URL in a new tab', () => {
    const targetUrl = openSelfHostedPlansUpsell({
      entry: ossUpsellEntries.tenantSettingsMembersOssUpsell,
    });

    expect(targetUrl).toContain('https://logto.io/self-hosted-plans');
    expect(targetUrl).toContain('utm_source=logto_oss');
    expect(targetUrl).toContain('utm_medium=console');
    expect(targetUrl).toContain('utm_campaign=self_hosted_plans');
    expect(targetUrl).toContain('utm_content=tenant_settings_members_oss_upsell');
    expect(mockWindowOpen).toHaveBeenCalledWith(targetUrl, '_blank', 'noopener,noreferrer');
  });

  it('returns the UTM-tagged Cloud URL without navigation when window is unavailable', () => {
    jest
      .spyOn(globalThis, 'window', 'get')
      .mockReturnValue(undefined as unknown as Window & typeof globalThis);

    const targetUrl = openCloudUpsell({
      entry: ossUpsellEntries.ossSidebarCloudCard,
    });

    expect(targetUrl).toContain('utm_source=logto_oss');
    expect(targetUrl).toContain('utm_content=oss_sidebar_cloud_card');
    expect(mockWindowOpen).not.toHaveBeenCalled();
  });
});
