import { ossUpsellEntries } from '@logto/schemas';

// Module-level mock for env constants. Must be declared before importing the module under test.
// eslint-disable-next-line @silverhand/fp/no-let
let mockOssSurveyEndpoint: string | undefined = 'https://survey.example.com';

jest.mock('@/consts/env', () => ({
  get ossSurveyEndpoint() {
    return mockOssSurveyEndpoint;
  },
}));

type NavigatorWithOptionalSendBeacon = Partial<Pick<Navigator, 'sendBeacon'>>;

type GlobalWithOptionalFetch = typeof globalThis & {
  fetch?: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
};

type MutableCrypto = {
  randomUUID?: () => string;
  getRandomValues?: Crypto['getRandomValues'];
};

describe('oss upsell helpers', () => {
  const mockWindowOpen = jest.fn<ReturnType<typeof window.open>, Parameters<typeof window.open>>();
  const mockSendBeacon = jest.fn<boolean, [string | URL, BodyInit | undefined]>();
  const mockFetch = jest.fn<Promise<Response>, [RequestInfo | URL, RequestInit?]>();
  const mockRandomUuid = jest.fn(
    (): `${string}-${string}-${string}-${string}-${string}` =>
      '01968a0d-5e94-7e6a-944a-12cc7ef3c3cf'
  );
  const mockGetRandomValues = jest.fn((array: Uint8Array) => {
    array.set([
      0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77, 0x88, 0x99, 0xaa, 0xbb, 0xcc, 0xdd, 0xee,
      0xff,
    ]);

    return array;
  });

  beforeEach(() => {
    const navigatorWithSendBeacon: NavigatorWithOptionalSendBeacon = navigator;
    const globalWithOptionalFetch: GlobalWithOptionalFetch = globalThis;
    const cryptoWithRandomUuid: MutableCrypto = globalThis.crypto;

    jest.restoreAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(1_776_902_215_123);
    jest.spyOn(window, 'open').mockImplementation(mockWindowOpen);
    // eslint-disable-next-line @silverhand/fp/no-mutation
    navigatorWithSendBeacon.sendBeacon = mockSendBeacon;
    // eslint-disable-next-line @silverhand/fp/no-mutation
    globalWithOptionalFetch.fetch = mockFetch;
    // eslint-disable-next-line @silverhand/fp/no-mutation
    cryptoWithRandomUuid.randomUUID = mockRandomUuid;
    // eslint-disable-next-line @silverhand/fp/no-mutation
    cryptoWithRandomUuid.getRandomValues = mockGetRandomValues as Crypto['getRandomValues'];

    mockWindowOpen.mockReset();
    mockSendBeacon.mockReset();
    mockSendBeacon.mockReturnValue(true);
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({ ok: true } as Response);
    mockRandomUuid.mockClear();
    mockGetRandomValues.mockClear();
    // eslint-disable-next-line @silverhand/fp/no-mutation
    mockOssSurveyEndpoint = 'https://survey.example.com';
  });

  it('uses the built-in crypto.randomUUID() helper for click ids', async () => {
    const { createUpsellClickId } = await import('./oss-upsell');

    expect(createUpsellClickId()).toBe('01968a0d-5e94-7e6a-944a-12cc7ef3c3cf');
    expect(mockRandomUuid).toHaveBeenCalledTimes(1);
  });

  it('falls back to crypto.getRandomValues() when randomUUID is unavailable', async () => {
    const { createUpsellClickId } = await import('./oss-upsell');
    const cryptoWithRandomUuid: MutableCrypto = globalThis.crypto;

    // eslint-disable-next-line @silverhand/fp/no-mutation
    cryptoWithRandomUuid.randomUUID = undefined;

    expect(createUpsellClickId()).toBe('00112233-4455-4677-8899-aabbccddeeff');
    expect(mockGetRandomValues).toHaveBeenCalledTimes(1);
  });

  it('falls back to a non-crypto v4 UUID when Web Crypto APIs are unavailable', async () => {
    const { createUpsellClickId } = await import('./oss-upsell');
    const cryptoWithRandomUuid: MutableCrypto = globalThis.crypto;

    // eslint-disable-next-line @silverhand/fp/no-mutation
    cryptoWithRandomUuid.randomUUID = undefined;
    // eslint-disable-next-line @silverhand/fp/no-mutation
    cryptoWithRandomUuid.getRandomValues = undefined;

    expect(createUpsellClickId()).toMatch(
      /^[\da-f]{8}-[\da-f]{4}-4[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i
    );
  });

  it('builds a tracked cloud upsell URL with the required query parameters', async () => {
    const { buildCloudUpsellUrl } = await import('./oss-upsell');

    const url = new URL(
      buildCloudUpsellUrl(ossUpsellEntries.getStartedOssCloudBanner, {
        path: '/to/applications',
        extraQuery: {
          plan: 'pro',
        },
        trackingData: {
          clickId: '01968a0d-5e94-7e6a-944a-12cc7ef3c3cf',
          timestamp: 1_776_902_215_123,
        },
      })
    );

    expect(url.origin).toBe('https://cloud.logto.io');
    expect(url.pathname).toBe('/to/applications');
    expect(url.searchParams.get('plan')).toBe('pro');
    expect(url.searchParams.get('logto_upsell_entry')).toBe('get_started_oss_cloud_banner');
    expect(url.searchParams.get('logto_upsell_click_id')).toBe(
      '01968a0d-5e94-7e6a-944a-12cc7ef3c3cf'
    );
    expect(url.searchParams.get('logto_upsell_ts')).toBe('1776902215123');
  });

  it('extracts and strips upsell tracking search parameters', async () => {
    const { getUpsellTrackingDataFromSearch, stripUpsellTrackingSearchParameters } = await import(
      './oss-upsell'
    );

    expect(
      getUpsellTrackingDataFromSearch(
        '?logto_upsell_entry=get_started_oss_cloud_banner&logto_upsell_click_id=01968a0d-5e94-7e6a-944a-12cc7ef3c3cf&logto_upsell_ts=1776902215123'
      )
    ).toEqual({
      entry: ossUpsellEntries.getStartedOssCloudBanner,
      clickId: '01968a0d-5e94-7e6a-944a-12cc7ef3c3cf',
      ts: 1_776_902_215_123,
    });

    expect(
      getUpsellTrackingDataFromSearch(
        '?logto_upsell_entry=unknown&logto_upsell_click_id=01968a0d-5e94-7e6a-944a-12cc7ef3c3cf&logto_upsell_ts=1776902215123'
      )
    ).toBeUndefined();
    expect(
      stripUpsellTrackingSearchParameters(
        '?logto_upsell_entry=get_started_oss_cloud_banner&logto_upsell_click_id=01968a0d-5e94-7e6a-944a-12cc7ef3c3cf&logto_upsell_ts=1776902215123&foo=bar'
      )
    ).toBe('?foo=bar');
  });

  it('reports upsell clicks with sendBeacon when the survey endpoint is configured', async () => {
    const { reportUpsellClick } = await import('./oss-upsell');

    reportUpsellClick({
      entry: ossUpsellEntries.ossSidebarCloudCard,
      clickId: '01968a0d-5e94-7e6a-944a-12cc7ef3c3cf',
      ts: 1_776_902_215_123,
      url: 'https://cloud.logto.io',
      sourcePath: '/console',
      sourceSearch: '?page=1',
    });

    expect(mockSendBeacon).toHaveBeenCalledTimes(1);
    expect(mockSendBeacon).toHaveBeenCalledWith(
      'https://survey.example.com/api/upsell-events',
      expect.any(Blob)
    );
    expect(mockFetch).not.toHaveBeenCalled();

    const [, blob] = mockSendBeacon.mock.calls[0]!;

    expect((blob as Blob).type).toBe('application/json');
  });

  it('reports upsell landings with fetch and skips sendBeacon', async () => {
    const { reportUpsellLanding } = await import('./oss-upsell');

    reportUpsellLanding({
      entry: ossUpsellEntries.getStartedOssCloudBanner,
      clickId: '01968a0d-5e94-7e6a-944a-12cc7ef3c3cf',
      ts: 1_776_902_215_123,
      url: 'https://cloud.logto.io?logto_upsell_entry=get_started_oss_cloud_banner',
      referrer: 'https://docs.logto.io',
    });

    await Promise.resolve();

    expect(mockSendBeacon).not.toHaveBeenCalled();
    expect(mockFetch).toHaveBeenCalledWith(
      new URL('https://survey.example.com/api/upsell-events'),
      expect.objectContaining({
        method: 'POST',
        keepalive: true,
        headers: {
          'content-type': 'application/json',
        },
      })
    );
  });

  it('falls back to fetch when sendBeacon is unavailable', async () => {
    const { reportUpsellClick } = await import('./oss-upsell');
    const navigatorWithSendBeacon: NavigatorWithOptionalSendBeacon = navigator;

    // eslint-disable-next-line @silverhand/fp/no-mutation
    navigatorWithSendBeacon.sendBeacon = undefined;

    reportUpsellClick({
      entry: ossUpsellEntries.tenantSettingsMembersOssUpsell,
      clickId: '01968a0d-5e94-7e6a-944a-12cc7ef3c3cf',
      ts: 1_776_902_215_123,
      url: 'https://cloud.logto.io',
    });

    await Promise.resolve();

    expect(mockFetch).toHaveBeenCalledWith(
      new URL('https://survey.example.com/api/upsell-events'),
      expect.objectContaining({
        method: 'POST',
        keepalive: true,
      })
    );
  });

  it('does not report upsell events when the survey endpoint is missing or invalid', async () => {
    const { reportUpsellClick, reportUpsellLanding } = await import('./oss-upsell');

    // eslint-disable-next-line @silverhand/fp/no-mutation
    mockOssSurveyEndpoint = undefined;

    reportUpsellClick({
      entry: ossUpsellEntries.signInExpBringYourUiOssCard,
      clickId: '01968a0d-5e94-7e6a-944a-12cc7ef3c3cf',
      ts: 1_776_902_215_123,
      url: 'https://cloud.logto.io',
    });

    // eslint-disable-next-line @silverhand/fp/no-mutation
    mockOssSurveyEndpoint = 'not a valid url';

    reportUpsellLanding({
      entry: ossUpsellEntries.signInExpHideLogtoBrandingOssNote,
      clickId: '01968a0d-5e94-7e6a-944a-12cc7ef3c3cf',
      ts: 1_776_902_215_123,
      url: 'https://cloud.logto.io',
    });

    expect(mockSendBeacon).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('opens a tracked Cloud URL in a new tab and reports the click', async () => {
    const { openCloudUpsell } = await import('./oss-upsell');

    const targetUrl = openCloudUpsell({
      entry: ossUpsellEntries.getStartedOssCloudBanner,
      path: '/to/applications',
    });

    expect(targetUrl).toContain('logto_upsell_entry=get_started_oss_cloud_banner');
    expect(targetUrl).toContain('logto_upsell_click_id=01968a0d-5e94-7e6a-944a-12cc7ef3c3cf');
    expect(mockWindowOpen).toHaveBeenCalledWith(targetUrl, '_blank', 'noopener,noreferrer');
    expect(mockSendBeacon).toHaveBeenCalledTimes(1);
  });
});
