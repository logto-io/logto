import { useLogto } from '@logto/react';
import { consoleUserPreferenceKey, Theme, type JsonObject } from '@logto/schemas';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { SWRConfig } from 'swr';

import { mockEnv, resetMockEnv, type EnvTestUtils } from '@/test-utils/env';

import useCurrentUser from './use-current-user';
import {
  filterUnreadProductUpdates,
  getProductUpdatesUrl,
  isProductUpdatesFeedUrl,
  productUpdateFeedItemGuard,
  productUpdatesFeedGuard,
  productUpdatesMaxAgeMs,
  useProductUpdates,
  type FilterUnreadProductUpdatesOptions,
  type ProductUpdateFeedItem,
  type ProductUpdateItem,
  type UseProductUpdatesResult,
} from './use-product-updates';

jest.mock('@/consts/env', () => jest.requireActual<EnvTestUtils>('@/test-utils/env').mockEnvModule);
jest.mock('@/components/Region', () => ({ defaultRegionName: 'US' }));
jest.mock('@logto/react', () => ({ useLogto: jest.fn() }));
jest.mock('./use-current-user', () => ({ __esModule: true, default: jest.fn() }));

const nowIso = '2026-11-23T00:00:00.000Z';
const nowMs = Date.parse(nowIso);

const makeFeedItem = (
  id: string,
  publishedDate: string,
  overrides: Partial<ProductUpdateFeedItem> = {}
): ProductUpdateFeedItem => ({
  id,
  title: `Title ${id}`,
  summary: `Summary ${id}`,
  publishedDate,
  ...overrides,
});

const withUrl = (
  item: ProductUpdateFeedItem,
  language = 'en',
  baseUrl = 'https://logto.io'
): ProductUpdateItem => ({
  ...item,
  url: getProductUpdatesUrl(language, ['updates', encodeURIComponent(item.id)], baseUrl) ?? '',
});

const createSwrWrapper =
  (cache = new Map()) =>
  ({ children }: { readonly children: ReactNode }) => (
    <SWRConfig value={{ provider: () => cache }}>{children}</SWRConfig>
  );

const filterIds = (
  items: readonly ProductUpdateFeedItem[],
  options: FilterUnreadProductUpdatesOptions
) => filterUnreadProductUpdates(items, options).map(({ id }) => id);

describe('getProductUpdatesUrl & isProductUpdatesFeedUrl', () => {
  it.each([
    ['en', ['updates.json'], 'https://logto.io', 'https://logto.io/updates.json'],
    ['EN', ['updates.json'], 'https://logto.io', 'https://logto.io/updates.json'],
    ['', ['updates.json'], 'https://logto.io', 'https://logto.io/updates.json'],
    ['zh-CN', ['updates.json'], 'https://logto.io', 'https://logto.io/zh-CN/updates.json'],
    [
      'fa-IR',
      ['updates.json'],
      'https://staging.logto.io///',
      'https://staging.logto.io/fa-IR/updates.json',
    ],
    [
      'en',
      ['updates', 'custom-domain'],
      'https://logto.io',
      'https://logto.io/updates/custom-domain',
    ],
    [
      'zh-CN',
      ['updates', 'custom-domain'],
      'https://logto.io/',
      'https://logto.io/zh-CN/updates/custom-domain',
    ],
    [
      'en',
      ['updates', encodeURIComponent('a/b c')],
      'https://staging.logto.io/',
      'https://staging.logto.io/updates/a%2Fb%20c',
    ],
  ])('builds URL for locale "%s" and path %j', (language, pathnames, baseUrl, expected) => {
    expect(getProductUpdatesUrl(language, pathnames, baseUrl)).toBe(expected);
  });

  it.each([
    ['https://logto.io/updates.json', 'https://logto.io', true],
    ['https://logto.io/zh-CN/updates.json', 'https://logto.io', true],
    ['https://staging.logto.io/pt-BR/updates.json', 'https://staging.logto.io///', true],
    ['https://other.example/updates.json', 'https://logto.io', false],
    ['/api/tenants/123/subscription', 'https://logto.io', false],
    ['https://logto.io/updates.json', '', false],
  ])('matches feed URL "%s" against "%s" -> %s', (key, baseUrl, expected) => {
    expect(isProductUpdatesFeedUrl(key, baseUrl)).toBe(expected);
  });
});

describe('productUpdatesFeedGuard', () => {
  it('accepts valid raw feed items without url and rejects malformed payloads', () => {
    const validItem = makeFeedItem('item-1', '2026-11-20T08:00:00.000Z');

    expect(productUpdateFeedItemGuard.safeParse(validItem).success).toBe(true);
    expect(productUpdatesFeedGuard.safeParse([validItem]).success).toBe(true);
    expect(productUpdatesFeedGuard.safeParse({ items: [validItem] }).success).toBe(false);
    expect(productUpdateFeedItemGuard.safeParse({ ...validItem, id: '' }).success).toBe(false);
    expect(productUpdateFeedItemGuard.safeParse({ ...validItem, title: '' }).success).toBe(false);
    expect(productUpdateFeedItemGuard.safeParse({ ...validItem, publishedDate: '' }).success).toBe(
      false
    );
  });
});

describe('filterUnreadProductUpdates', () => {
  it('excludes items published at or before userCreatedAt', () => {
    const userCreatedAtIso = '2026-11-10T00:00:00.000Z';
    const items = [
      makeFeedItem('older', '2026-11-09T23:59:59.999Z'),
      makeFeedItem('exact', userCreatedAtIso),
      makeFeedItem('newer', '2026-11-10T00:00:00.001Z'),
    ];

    expect(filterIds(items, { userCreatedAt: Date.parse(userCreatedAtIso), now: nowMs })).toEqual([
      'newer',
    ]);
  });

  it('excludes items published at or before max(userCreatedAt, lastReadUpdateAt)', () => {
    const items = [
      makeFeedItem('before-read', '2026-11-14T00:00:00.000Z'),
      makeFeedItem('at-read', '2026-11-15T12:00:00.000Z'),
      makeFeedItem('after-read', '2026-11-16T00:00:00.000Z'),
    ];

    expect(
      filterIds(items, {
        userCreatedAt: Date.parse('2026-11-01T00:00:00.000Z'),
        lastReadUpdateAt: '2026-11-15T12:00:00.000Z',
        now: nowMs,
      })
    ).toEqual(['after-read']);

    expect(
      filterIds(items, {
        userCreatedAt: Date.parse('2026-11-15T12:00:00.000Z'),
        lastReadUpdateAt: '2026-11-01T00:00:00.000Z',
        now: nowMs,
      })
    ).toEqual(['after-read']);
  });

  it('enforces the 30-day cutoff boundary', () => {
    const items = [
      makeFeedItem('expired', new Date(nowMs - productUpdatesMaxAgeMs - 1).toISOString()),
      makeFeedItem('boundary', new Date(nowMs - productUpdatesMaxAgeMs).toISOString()),
      makeFeedItem('recent', new Date(nowMs - 1000).toISOString()),
    ];

    expect(
      filterIds(items, { userCreatedAt: Date.parse('2026-01-01T00:00:00.000Z'), now: nowMs })
    ).toEqual(['recent', 'boundary']);
  });

  it('excludes invalid dates and safely ignores corrupted lastReadUpdateAt', () => {
    const items = [
      makeFeedItem('invalid-date', 'not-a-date'),
      makeFeedItem('valid', '2026-11-20T00:00:00.000Z'),
    ];

    expect(
      filterIds(items, {
        userCreatedAt: Date.parse('2026-11-01T00:00:00.000Z'),
        lastReadUpdateAt: 'invalid-watermark',
        now: nowMs,
      })
    ).toEqual(['valid']);
    expect(filterIds(items, { userCreatedAt: Number.NaN, now: nowMs })).toEqual([]);
  });

  it('sorts unread items descending by publishedDate without mutating input', () => {
    const items = [
      makeFeedItem('middle', '2026-11-15T00:00:00.000Z'),
      makeFeedItem('newest', '2026-11-22T00:00:00.000Z'),
      makeFeedItem('oldest', '2026-11-10T00:00:00.000Z'),
    ];
    const snapshot = [...items];

    expect(
      filterIds(items, { userCreatedAt: Date.parse('2026-11-01T00:00:00.000Z'), now: nowMs })
    ).toEqual(['newest', 'middle', 'oldest']);
    expect(items).toEqual(snapshot);
  });
});

describe('useProductUpdates', () => {
  const originalFetch = global.fetch;
  const mockFetch = jest.fn();
  const mockUpdateCustomData = jest.fn();

  const mockAuthenticatedUser = ({
    id = 'user-1',
    createdAt = Date.parse('2026-11-01T00:00:00.000Z'),
    customData = {},
    isLoaded = true,
    isAuthenticated = true,
  }: {
    id?: string;
    createdAt?: number;
    customData?: JsonObject;
    isLoaded?: boolean;
    isAuthenticated?: boolean;
  } = {}) => {
    const logtoValue = { isAuthenticated };
    jest.mocked(useLogto).mockReturnValue(logtoValue as ReturnType<typeof useLogto>);

    const userValue = { id, createdAt, customData };
    jest.mocked(useCurrentUser).mockReturnValue({
      user: isLoaded ? (userValue as ReturnType<typeof useCurrentUser>['user']) : undefined,
      isLoading: !isLoaded,
      isLoaded,
      error: undefined,
      reload: jest.fn(),
      customData,
      updateCustomData: mockUpdateCustomData,
    });
  };

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(nowMs);
    jest.clearAllMocks();
    resetMockEnv();
    mockEnv({ isCloud: true, productUpdatesBaseUrl: 'https://logto.io' });
    mockUpdateCustomData.mockResolvedValue(undefined);
    // eslint-disable-next-line @silverhand/fp/no-mutation -- replace global fetch for unit testing
    global.fetch = mockFetch as unknown as typeof fetch;
    mockAuthenticatedUser();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // eslint-disable-next-line @silverhand/fp/no-mutation -- restore global fetch after unit test
    global.fetch = originalFetch;
  });

  it('makes zero network requests and returns empty items when !isCloud', () => {
    mockEnv({ isCloud: false });

    const { result } = renderHook<UseProductUpdatesResult, unknown>(() => useProductUpdates(), {
      wrapper: createSwrWrapper(),
    });

    expect(result.current.items).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockUpdateCustomData).not.toHaveBeenCalled();
  });

  it('waits until authenticated and user data are loaded, then derives English item URLs', async () => {
    mockAuthenticatedUser({ isAuthenticated: false, isLoaded: false });

    const { result, rerender } = renderHook(() => useProductUpdates(), {
      wrapper: createSwrWrapper(),
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.items).toEqual([]);

    const feedItem = makeFeedItem('update-1', '2026-11-20T00:00:00.000Z');
    mockFetch.mockResolvedValue({ ok: true, json: async () => [feedItem] });

    mockAuthenticatedUser({ isAuthenticated: true, isLoaded: true });
    rerender();

    await waitFor(() => {
      expect(result.current.items).toEqual([withUrl(feedItem)]);
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('https://logto.io/updates.json');
  });

  it('fetches localized feed URL and derives localized item URLs with custom base URL', async () => {
    mockEnv({ isCloud: true, productUpdatesBaseUrl: 'https://staging.logto.io/' });
    mockAuthenticatedUser({
      customData: {
        [consoleUserPreferenceKey]: { language: 'zh-CN', appearanceMode: Theme.Dark },
      },
    });
    const feedItem = makeFeedItem('zh-update', '2026-11-21T00:00:00.000Z');
    mockFetch.mockResolvedValue({ ok: true, json: async () => [feedItem] });

    const { result } = renderHook(() => useProductUpdates(), { wrapper: createSwrWrapper() });

    await waitFor(() => {
      expect(result.current.items).toEqual([
        withUrl(feedItem, 'zh-CN', 'https://staging.logto.io'),
      ]);
    });
    expect(mockFetch).toHaveBeenCalledWith('https://staging.logto.io/zh-CN/updates.json');
  });

  it('fetches once per page load across remounts sharing the SWR cache', async () => {
    const wrapper = createSwrWrapper(new Map());
    const feedItem = makeFeedItem('update-1', '2026-11-20T00:00:00.000Z');
    mockFetch.mockResolvedValue({ ok: true, json: async () => [feedItem] });

    const firstMount = renderHook(() => useProductUpdates(), { wrapper });
    await waitFor(() => {
      expect(firstMount.result.current.items).toEqual([withUrl(feedItem)]);
    });
    firstMount.unmount();

    const secondMount = renderHook(() => useProductUpdates(), { wrapper });
    await waitFor(() => {
      expect(secondMount.result.current.items).toEqual([withUrl(feedItem)]);
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['network error', () => mockFetch.mockRejectedValue(new Error('Network down'))],
    ['non-200 response', () => mockFetch.mockResolvedValue({ ok: false, status: 500 })],
    [
      'malformed JSON',
      () =>
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => {
            throw new SyntaxError('Unexpected token');
          },
        }),
    ],
    [
      'invalid Zod schema',
      () => mockFetch.mockResolvedValue({ ok: true, json: async () => [{ id: 'broken' }] }),
    ],
  ])('fails silently on %s', async (_label, setupMock) => {
    setupMock();

    const { result } = renderHook(() => useProductUpdates(), { wrapper: createSwrWrapper() });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
    expect(result.current.items).toEqual([]);
    expect(mockUpdateCustomData).not.toHaveBeenCalled();
  });

  it('writes lastReadUpdateAt once on first interaction preserving preferences and keeping remaining items', async () => {
    const existingPreferences = {
      language: 'en',
      appearanceMode: Theme.Dark,
      mfaUpsellNoticeAcknowledged: true,
    };
    const oldest = makeFeedItem('update-1', '2026-11-12T00:00:00.000Z');
    const middle = makeFeedItem('update-2', '2026-11-18T00:00:00.000Z');
    const newest = makeFeedItem('update-3', '2026-11-22T09:00:00.000Z');

    mockAuthenticatedUser({ customData: { [consoleUserPreferenceKey]: existingPreferences } });
    mockFetch.mockResolvedValue({ ok: true, json: async () => [oldest, newest, middle] });

    const { result, rerender } = renderHook(() => useProductUpdates(), {
      wrapper: createSwrWrapper(),
    });

    await waitFor(() => {
      expect(result.current.items.map(({ id }) => id)).toEqual([
        'update-3',
        'update-2',
        'update-1',
      ]);
    });

    expect(mockUpdateCustomData).not.toHaveBeenCalled();

    act(() => {
      result.current.dismissItem('update-3');
    });

    expect(mockUpdateCustomData).toHaveBeenCalledTimes(1);
    expect(mockUpdateCustomData).toHaveBeenCalledWith({
      [consoleUserPreferenceKey]: {
        ...existingPreferences,
        lastReadUpdateAt: newest.publishedDate,
      },
    });
    expect(result.current.items.map(({ id }) => id)).toEqual(['update-2', 'update-1']);

    mockAuthenticatedUser({
      customData: {
        [consoleUserPreferenceKey]: {
          ...existingPreferences,
          lastReadUpdateAt: newest.publishedDate,
        },
      },
    });
    rerender();
    expect(result.current.items.map(({ id }) => id)).toEqual(['update-2', 'update-1']);

    act(() => {
      result.current.markInteracted();
      result.current.dismissItem('update-2');
      result.current.dismissAll();
    });

    expect(result.current.items).toEqual([]);
    expect(mockUpdateCustomData).toHaveBeenCalledTimes(1);
  });

  it('writes lastReadUpdateAt once on markInteracted and dismissAll, swallowing errors silently', async () => {
    const itemA = makeFeedItem('update-a', '2026-11-19T00:00:00.000Z');
    const itemB = makeFeedItem('update-b', '2026-11-21T00:00:00.000Z');

    mockFetch.mockResolvedValue({ ok: true, json: async () => [itemA, itemB] });
    mockUpdateCustomData.mockRejectedValueOnce(new Error('Account API error'));

    const firstHook = renderHook(() => useProductUpdates(), { wrapper: createSwrWrapper() });
    await waitFor(() => {
      expect(firstHook.result.current.items.map(({ id }) => id)).toEqual(['update-b', 'update-a']);
    });

    act(() => {
      firstHook.result.current.markInteracted();
    });
    expect(mockUpdateCustomData).toHaveBeenCalledTimes(1);
    expect(mockUpdateCustomData.mock.calls[0]?.[0]).toMatchObject({
      [consoleUserPreferenceKey]: { lastReadUpdateAt: itemB.publishedDate },
    });
    expect(firstHook.result.current.items.map(({ id }) => id)).toEqual(['update-b', 'update-a']);

    act(() => {
      firstHook.result.current.dismissAll();
    });
    expect(firstHook.result.current.items).toEqual([]);
    expect(mockUpdateCustomData).toHaveBeenCalledTimes(1);

    mockUpdateCustomData.mockClear();
    const secondHook = renderHook(() => useProductUpdates(), { wrapper: createSwrWrapper() });
    await waitFor(() => {
      expect(secondHook.result.current.items).toHaveLength(2);
    });

    act(() => {
      secondHook.result.current.dismissAll();
    });
    expect(secondHook.result.current.items).toEqual([]);
    expect(mockUpdateCustomData).toHaveBeenCalledTimes(1);
    expect(mockUpdateCustomData.mock.calls[0]?.[0]).toMatchObject({
      [consoleUserPreferenceKey]: { lastReadUpdateAt: itemB.publishedDate },
    });
  });
});
