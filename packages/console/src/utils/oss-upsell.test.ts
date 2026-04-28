import { buildCloudUpsellUrl, openCloudUpsell, ossUpsellEntries } from './oss-upsell';

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
