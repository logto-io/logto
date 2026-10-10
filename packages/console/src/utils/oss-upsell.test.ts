import {
  buildCloudUpsellUrl,
  buildSelfHostedPlansUrl,
  openCloudUpsell,
  openSelfHostedPlansUpsell,
  ossUpsellEntries,
} from './oss-upsell';

describe('oss upsell helpers', () => {
  const mockWindowOpen = jest.fn<ReturnType<typeof window.open>, Parameters<typeof window.open>>();
  const mockLocationAssign = jest.fn<void, [string]>();

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(window, 'open').mockImplementation(mockWindowOpen);
    mockWindowOpen.mockReset();
    mockLocationAssign.mockReset();
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

  describe('with the License page available', () => {
    it('builds an in-Console License page path tagged with the entry only', () => {
      const href = buildSelfHostedPlansUrl(ossUpsellEntries.tenantSettingsMembersOssUpsell);
      const url = new URL(href, 'https://example.com');

      expect(href.startsWith('/')).toBe(true);
      expect(url.pathname).toBe('/console/tenant-settings/license');
      expect(url.searchParams.get('utm_content')).toBe('tenant_settings_members_oss_upsell');
      expect(url.searchParams.has('utm_source')).toBe(false);
      expect(url.searchParams.has('utm_medium')).toBe(false);
      expect(url.searchParams.has('utm_campaign')).toBe(false);
    });

    it.each(Object.values(ossUpsellEntries))('keeps the %s entry distinguishable', (entry) => {
      const url = new URL(buildSelfHostedPlansUrl(entry), 'https://example.com');

      expect(url.pathname).toBe('/console/tenant-settings/license');
      expect(url.searchParams.get('utm_content')).toBe(entry);
    });

    it('navigates to the License page in the same tab', () => {
      jest.spyOn(window, 'location', 'get').mockReturnValue({
        ...window.location,
        assign: mockLocationAssign,
      });

      const targetUrl = openSelfHostedPlansUpsell({
        entry: ossUpsellEntries.tenantSettingsMembersOssUpsell,
      });

      expect(targetUrl).toBe(
        '/console/tenant-settings/license?utm_content=tenant_settings_members_oss_upsell'
      );
      expect(mockLocationAssign).toHaveBeenCalledWith(targetUrl);
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });
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
