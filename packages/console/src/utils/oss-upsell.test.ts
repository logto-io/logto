// Module-level mock for env constants. Must be declared before importing the module under test.
// eslint-disable-next-line @silverhand/fp/no-let
let mockOssUpsellTrackingEndpoint: string | undefined = 'https://analytics.example.com';

jest.mock('@/consts/env', () => ({
  get ossUpsellTrackingEndpoint() {
    return mockOssUpsellTrackingEndpoint;
  },
}));

type NavigatorWithOptionalSendBeacon = Partial<Pick<Navigator, 'sendBeacon'>>;

type GlobalWithOptionalFetch = typeof globalThis & {
  fetch?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
};

describe('oss upsell helpers', () => {
  const mockWindowOpen = jest.fn<ReturnType<typeof window.open>, Parameters<typeof window.open>>();
  const mockSendBeacon = jest.fn<boolean, [string | URL, BodyInit | undefined]>();
  const mockFetch = jest.fn<Promise<Response>, [RequestInfo | URL, RequestInit?]>();

  beforeEach(() => {
    const navigatorWithSendBeacon: NavigatorWithOptionalSendBeacon = navigator;
    const globalWithOptionalFetch: GlobalWithOptionalFetch = globalThis;

    jest.restoreAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(1_776_902_215_123);
    jest.spyOn(globalThis.crypto, 'getRandomValues').mockImplementation((array) => {
      if (array instanceof Uint8Array) {
        array.set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
      }

      return array;
    });
    jest.spyOn(window, 'open').mockImplementation(mockWindowOpen);
    // eslint-disable-next-line @silverhand/fp/no-mutation
    navigatorWithSendBeacon.sendBeacon = mockSendBeacon;
    // eslint-disable-next-line @silverhand/fp/no-mutation
    globalWithOptionalFetch.fetch = mockFetch;

    mockWindowOpen.mockReset();
    mockSendBeacon.mockReset();
    mockSendBeacon.mockReturnValue(true);
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({ ok: true } as Response);
    // eslint-disable-next-line @silverhand/fp/no-mutation
    mockOssUpsellTrackingEndpoint = 'https://analytics.example.com';
  });

  it('builds a tracked cloud upsell URL with the required query parameters', async () => {
    const { buildCloudUpsellUrl, ossUpsellEntries } = await import('./oss-upsell');

    const url = new URL(
      buildCloudUpsellUrl(ossUpsellEntries.getStartedOssCloudBanner, {
        path: '/to/applications',
        extraQuery: {
          plan: 'pro',
        },
      })
    );

    expect(url.origin).toBe('https://cloud.logto.io');
    expect(url.pathname).toBe('/to/applications');
    expect(url.searchParams.get('plan')).toBe('pro');
    expect(url.searchParams.get('entry')).toBe('get_started_oss_cloud_banner');
    expect(url.searchParams.get('click_id')).toBe('01020304-0506-4708-890a-0b0c0d0e0f10');
    expect(url.searchParams.get('ts')).toBe('1776902215123');
  });

  it('reports upsell clicks with sendBeacon when the tracking endpoint is configured', async () => {
    const { reportUpsellClick, ossUpsellEntries } = await import('./oss-upsell');

    reportUpsellClick({
      entry: ossUpsellEntries.ossSidebarCloudCard,
      clickId: '01020304-0506-4708-890a-0b0c0d0e0f10',
      ts: 1_776_902_215_123,
      targetUrl: 'https://cloud.logto.io',
      sourcePath: '/console',
      sourceSearch: '?page=1',
    });

    expect(mockSendBeacon).toHaveBeenCalledTimes(1);
    expect(mockSendBeacon).toHaveBeenCalledWith(
      'https://analytics.example.com/internal/analytics/upsell-click',
      expect.any(Blob)
    );
    expect(mockFetch).not.toHaveBeenCalled();

    const [, blob] = mockSendBeacon.mock.calls[0]!;

    expect((blob as Blob).type).toBe('application/json');
  });

  it('falls back to fetch when sendBeacon is unavailable or rejected', async () => {
    const { reportUpsellClick, ossUpsellEntries } = await import('./oss-upsell');
    const navigatorWithSendBeacon: NavigatorWithOptionalSendBeacon = navigator;

    // eslint-disable-next-line @silverhand/fp/no-mutation
    navigatorWithSendBeacon.sendBeacon = undefined;

    reportUpsellClick({
      entry: ossUpsellEntries.tenantSettingsMembersOssUpsell,
      clickId: '01020304-0506-4708-890a-0b0c0d0e0f10',
      ts: 1_776_902_215_123,
      targetUrl: 'https://cloud.logto.io',
    });

    await Promise.resolve();

    expect(mockFetch).toHaveBeenCalledWith(
      new URL('https://analytics.example.com/internal/analytics/upsell-click'),
      expect.objectContaining({
        method: 'POST',
        keepalive: true,
        headers: {
          'content-type': 'application/json',
        },
      })
    );
  });

  it('does not report upsell clicks when the tracking endpoint is missing or invalid', async () => {
    const { reportUpsellClick, ossUpsellEntries } = await import('./oss-upsell');

    // eslint-disable-next-line @silverhand/fp/no-mutation
    mockOssUpsellTrackingEndpoint = undefined;

    reportUpsellClick({
      entry: ossUpsellEntries.signInExpBringYourUiOssCard,
      clickId: '01020304-0506-4708-890a-0b0c0d0e0f10',
      ts: 1_776_902_215_123,
      targetUrl: 'https://cloud.logto.io',
    });

    // eslint-disable-next-line @silverhand/fp/no-mutation
    mockOssUpsellTrackingEndpoint = 'not a valid url';

    reportUpsellClick({
      entry: ossUpsellEntries.signInExpHideLogtoBrandingOssNote,
      clickId: '01020304-0506-4708-890a-0b0c0d0e0f10',
      ts: 1_776_902_215_123,
      targetUrl: 'https://cloud.logto.io',
    });

    expect(mockSendBeacon).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('opens a tracked Cloud URL in a new tab and reports the click', async () => {
    const { openCloudUpsell, ossUpsellEntries } = await import('./oss-upsell');

    const targetUrl = openCloudUpsell({
      entry: ossUpsellEntries.getStartedOssCloudBanner,
      path: '/to/applications',
    });

    expect(targetUrl).toContain('entry=get_started_oss_cloud_banner');
    expect(mockWindowOpen).toHaveBeenCalledWith(targetUrl, '_blank', 'noopener,noreferrer');
    expect(mockSendBeacon).toHaveBeenCalledTimes(1);
  });
});
