import resources from '@logto/phrases';
import { useLogto } from '@logto/react';
import { consoleUserPreferenceKey, Theme, type JsonObject } from '@logto/schemas';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import i18next from 'i18next';
import { usePostHog } from 'posthog-js/react';
import { type ReactNode } from 'react';
import { SWRConfig } from 'swr';

import useCurrentUser from '@/hooks/use-current-user';
import { type ProductUpdateItem } from '@/hooks/use-product-updates';
import { mockEnv, resetMockEnv, type EnvTestUtils } from '@/test-utils/env';

import ProductUpdatesContainer from './ProductUpdatesContainer';

jest.mock('@/consts/env', () => jest.requireActual<EnvTestUtils>('@/test-utils/env').mockEnvModule);
jest.mock('@/components/Region', () => ({ defaultRegionName: 'US' }));
jest.mock('@logto/react', () => ({ useLogto: jest.fn() }));
jest.mock('@/hooks/use-current-user', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('posthog-js/react', () => ({ usePostHog: jest.fn() }));

const nowIso = '2026-11-23T12:00:00.000Z';
const nowMs = Date.parse(nowIso);

const makeItem = (id: string, publishedDate: string): ProductUpdateItem => ({
  id,
  title: `Title ${id}`,
  summary: `Summary ${id}`,
  publishedDate,
  url: `https://logto.io/updates/${id}`,
});

const createSwrWrapper =
  (cache = new Map()) =>
  ({ children }: { readonly children: ReactNode }) => (
    <SWRConfig value={{ provider: () => cache }}>{children}</SWRConfig>
  );

describe('ProductUpdatesContainer', () => {
  const originalFetch = global.fetch;
  const mockFetch = jest.fn();
  const mockUpdateCustomData = jest.fn();
  const mockCapture = jest.fn();

  const mockUser = ({
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

  beforeAll(() => {
    i18next.addResourceBundle('en', 'translation', resources.en.translation, true);
  });

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(nowMs);
    jest.clearAllMocks();
    resetMockEnv();
    mockUpdateCustomData.mockResolvedValue(undefined);
    jest.mocked(usePostHog).mockReturnValue({
      capture: mockCapture,
    } as unknown as ReturnType<typeof usePostHog>);
    // eslint-disable-next-line @silverhand/fp/no-mutation -- replace global fetch for integration test
    global.fetch = mockFetch as unknown as typeof fetch;
    mockUser();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // eslint-disable-next-line @silverhand/fp/no-mutation -- restore global fetch after integration test
    global.fetch = originalFetch;
  });

  it('is a complete no-op in OSS builds (isCloud = false)', () => {
    mockEnv({ isCloud: false });

    const { container } = render(<ProductUpdatesContainer />, { wrapper: createSwrWrapper() });

    expect(container.firstChild).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockCapture).not.toHaveBeenCalled();
    expect(mockUpdateCustomData).not.toHaveBeenCalled();
  });

  it('handles full Cloud lifecycle: passive impression dedup, click, dismiss, and clear all', async () => {
    mockEnv({
      isCloud: true,
      isDevFeaturesEnabled: true,
      productUpdatesBaseUrl: 'https://logto.io',
    });

    const existingPreferences = {
      language: 'en',
      appearanceMode: Theme.Dark,
    };
    mockUser({
      customData: { [consoleUserPreferenceKey]: existingPreferences },
    });

    const item1 = makeItem('update-1', '2026-11-12T00:00:00.000Z');
    const item2 = makeItem('update-2', '2026-11-16T00:00:00.000Z');
    const item3 = makeItem('update-3', '2026-11-19T00:00:00.000Z');
    const item4 = makeItem('update-4', '2026-11-22T09:00:00.000Z');
    mockFetch.mockResolvedValue({ ok: true, json: async () => [item1, item4, item2, item3] });

    const wrapper = createSwrWrapper();
    const { rerender } = render(<ProductUpdatesContainer />, { wrapper });

    // Passive render shows newest item first and fires console:update_card_shown once
    expect(await screen.findByText(item4.title)).not.toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('https://logto.io/updates.json');
    expect(mockUpdateCustomData).not.toHaveBeenCalled();
    expect(mockCapture).toHaveBeenCalledTimes(1);
    expect(mockCapture).toHaveBeenLastCalledWith('console:update_card_shown', {
      update_id: item4.id,
      language: 'en',
    });

    // Re-rendering or temporarily hiding/showing never duplicates console:update_card_shown
    rerender(<ProductUpdatesContainer />);
    rerender(<ProductUpdatesContainer isHidden />);
    expect(screen.queryByRole('region', { name: 'Product updates' })).toBeNull();
    rerender(<ProductUpdatesContainer isHidden={false} />);
    expect(screen.getByText(item4.title)).not.toBeNull();
    expect(mockCapture).toHaveBeenCalledTimes(1);
    expect(mockUpdateCustomData).not.toHaveBeenCalled();

    // Clicking/opening top card fires update_card_clicked, removes card, writes watermark once, and shows next card
    const topLink = screen.getByRole('link');
    expect(topLink.getAttribute('href')).toBe(item4.url);
    expect(topLink.getAttribute('target')).toBe('_blank');
    expect(topLink.getAttribute('rel')).toBe('noopener noreferrer');
    fireEvent.click(topLink);

    await waitFor(() => {
      expect(screen.getByText(item3.title)).not.toBeNull();
    });
    expect(screen.queryByText(item4.title)).toBeNull();
    expect(mockUpdateCustomData).toHaveBeenCalledTimes(1);
    expect(mockUpdateCustomData).toHaveBeenCalledWith({
      [consoleUserPreferenceKey]: {
        ...existingPreferences,
        lastReadUpdateAt: item4.publishedDate,
      },
    });
    expect(mockCapture).toHaveBeenNthCalledWith(2, 'console:update_card_clicked', {
      update_id: item4.id,
      language: 'en',
    });
    expect(mockCapture).toHaveBeenNthCalledWith(3, 'console:update_card_shown', {
      update_id: item3.id,
      language: 'en',
    });

    // Dismissing single card fires update_card_dismissed, removes card, and does NOT write watermark again
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

    await waitFor(() => {
      expect(screen.getByText(item2.title)).not.toBeNull();
    });
    expect(screen.queryByText(item3.title)).toBeNull();
    expect(mockUpdateCustomData).toHaveBeenCalledTimes(1);
    expect(mockCapture).toHaveBeenNthCalledWith(4, 'console:update_card_dismissed', {
      update_id: item3.id,
      language: 'en',
    });
    expect(mockCapture).toHaveBeenNthCalledWith(5, 'console:update_card_shown', {
      update_id: item2.id,
      language: 'en',
    });

    // Clear All fires update_dismiss_all with remaining count & IDs and clears the stack
    fireEvent.click(screen.getByRole('button', { name: 'Clear all (2)' }));

    await waitFor(() => {
      expect(screen.queryByRole('region', { name: 'Product updates' })).toBeNull();
    });
    expect(mockUpdateCustomData).toHaveBeenCalledTimes(1);
    expect(mockCapture).toHaveBeenCalledTimes(6);
    expect(mockCapture).toHaveBeenNthCalledWith(6, 'console:update_dismiss_all', {
      count: 2,
      update_ids: [item2.id, item1.id],
      language: 'en',
    });
  });

  it('reports user preference language on localized feed events', async () => {
    mockEnv({
      isCloud: true,
      isDevFeaturesEnabled: true,
      productUpdatesBaseUrl: 'https://logto.io',
    });
    mockUser({
      customData: {
        [consoleUserPreferenceKey]: { language: 'zh-CN', appearanceMode: Theme.Light },
      },
    });

    const item = makeItem('zh-update', '2026-11-22T00:00:00.000Z');
    mockFetch.mockResolvedValue({ ok: true, json: async () => [item] });

    render(<ProductUpdatesContainer />, { wrapper: createSwrWrapper() });

    expect(await screen.findByText(item.title)).not.toBeNull();
    expect(mockFetch).toHaveBeenCalledWith('https://logto.io/zh-CN/updates.json');
    expect(mockCapture).toHaveBeenCalledWith('console:update_card_shown', {
      update_id: item.id,
      language: 'zh-CN',
    });
  });
});
