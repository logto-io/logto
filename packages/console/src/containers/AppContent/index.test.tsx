import resources from '@logto/phrases';
import { useLogto } from '@logto/react';
import { TenantTag, type JsonObject } from '@logto/schemas';
import { noop } from '@silverhand/essentials';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import i18next from 'i18next';
import { usePostHog } from 'posthog-js/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';

import { type TenantResponse } from '@/cloud/types/router';
import useSubscriptionData from '@/contexts/SubscriptionDataProvider/use-subscription-data';
import { TenantsContext } from '@/contexts/TenantsProvider';
import useCurrentUser from '@/hooks/use-current-user';
import { type ProductUpdateItem } from '@/hooks/use-product-updates';
import { mockEnv, resetMockEnv, type EnvTestUtils } from '@/test-utils/env';

import AppContent from '.';

jest.mock('@/consts/env', () => jest.requireActual<EnvTestUtils>('@/test-utils/env').mockEnvModule);
jest.mock('@/components/Region', () => ({ defaultRegionName: 'US' }));
jest.mock('@logto/react', () => ({ useLogto: jest.fn() }));
jest.mock('@/hooks/use-current-user', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/contexts/SubscriptionDataProvider/use-subscription-data', () => ({
  __esModule: true,
  default: jest.fn(),
}));
jest.mock('posthog-js/react', () => ({ usePostHog: jest.fn() }));
jest.mock('@/components/AppLoading', () => ({
  __esModule: true,
  default: () => <div data-testid="app-loading">Loading</div>,
}));
jest.mock('@/components/Topbar', () => ({
  __esModule: true,
  default: () => <div data-testid="topbar">Topbar</div>,
}));
jest.mock('./TenantNotificationContainer', () => ({
  __esModule: true,
  default: () => <div data-testid="tenant-notifications" />,
}));
jest.mock('./TenantSuspendedPage', () => ({
  __esModule: true,
  default: () => <div data-testid="tenant-suspended">Suspended</div>,
}));

const nowIso = '2026-11-23T12:00:00.000Z';
const nowMs = Date.parse(nowIso);

const makeTenant = (id: string, isSuspended = false): TenantResponse => {
  const tenant = {
    id,
    name: `Tenant ${id}`,
    tag: TenantTag.Development,
    isSuspended,
  };

  return tenant as TenantResponse;
};

const makeItem = (id: string, publishedDate: string): ProductUpdateItem => ({
  id,
  title: `Title ${id}`,
  summary: `Summary ${id}`,
  publishedDate,
  url: `https://logto.io/updates/${id}`,
});

const mockSubscription = (isLoading = false) => {
  const subscriptionData = {
    isLoading,
    logtoSkus: [],
    currentSku: {},
    currentSubscription: {},
    onCurrentSubscriptionUpdated: jest.fn(),
    mutateSubscriptionQuotaAndUsages: jest.fn(),
    currentSubscriptionQuota: {},
    currentSubscriptionBasicQuota: {},
    currentSubscriptionUsage: {},
    currentSubscriptionResourceScopeUsage: {},
    currentSubscriptionRoleScopeUsage: {},
    license: undefined,
    licenseQuota: undefined,
    mutateLicense: jest.fn(),
  };

  jest
    .mocked(useSubscriptionData)
    .mockReturnValue(subscriptionData as unknown as ReturnType<typeof useSubscriptionData>);
};

const renderAppContent = (tenant: TenantResponse, cache = new Map()) => {
  const buildTree = (currentTenant: TenantResponse) => (
    <SWRConfig value={{ provider: () => cache }}>
      <MemoryRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        initialEntries={[`/${currentTenant.id}/dashboard`]}
      >
        <TenantsContext.Provider
          value={{
            tenants: [currentTenant],
            isInitComplete: true,
            resetTenants: noop,
            prependTenant: noop,
            removeTenant: noop,
            updateTenant: noop,
            currentTenantId: currentTenant.id,
            currentTenant,
            isDevTenant: true,
            navigateTenant: noop,
          }}
        >
          <Routes>
            <Route element={<AppContent />}>
              <Route path="*" element={<div data-testid="outlet-page">Page</div>} />
            </Route>
          </Routes>
        </TenantsContext.Provider>
      </MemoryRouter>
    </SWRConfig>
  );

  const rendered = render(buildTree(tenant));
  return {
    ...rendered,
    rerenderTenant: (nextTenant: TenantResponse) => {
      rendered.rerender(buildTree(nextTenant));
    },
  };
};

describe('AppContent product updates mount', () => {
  const originalFetch = global.fetch;
  const mockFetch = jest.fn();
  const mockUpdateCustomData = jest.fn();
  const mockCapture = jest.fn();

  const mockUser = (customData: JsonObject = {}) => {
    const logtoValue = { isAuthenticated: true };
    jest.mocked(useLogto).mockReturnValue(logtoValue as ReturnType<typeof useLogto>);

    const userValue = {
      id: 'user-1',
      createdAt: Date.parse('2026-11-01T00:00:00.000Z'),
      customData,
    };

    jest.mocked(useCurrentUser).mockReturnValue({
      user: userValue as ReturnType<typeof useCurrentUser>['user'],
      isLoading: false,
      isLoaded: true,
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
    // eslint-disable-next-line @silverhand/fp/no-mutation -- replace global fetch for root layout integration test
    global.fetch = mockFetch as unknown as typeof fetch;
    mockUser();
    mockSubscription(false);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // eslint-disable-next-line @silverhand/fp/no-mutation -- restore global fetch after root layout integration test
    global.fetch = originalFetch;
  });

  it('does not mount product updates or fetch in OSS builds', () => {
    mockEnv({ isCloud: false, isDevFeaturesEnabled: true });

    renderAppContent(makeTenant('default'));

    expect(screen.getByTestId('outlet-page')).not.toBeNull();
    expect(screen.queryByRole('region', { name: 'Product updates' })).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockCapture).not.toHaveBeenCalled();
  });

  it('does not mount product updates or fetch when dev features are disabled on Cloud', () => {
    mockEnv({ isCloud: true, isDevFeaturesEnabled: false });

    renderAppContent(makeTenant('tenant-a'));

    expect(screen.getByTestId('outlet-page')).not.toBeNull();
    expect(screen.queryByRole('region', { name: 'Product updates' })).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockCapture).not.toHaveBeenCalled();
  });

  it('persists session state across tenant switches and hides over loading and suspended states', async () => {
    mockEnv({
      isCloud: true,
      isDevFeaturesEnabled: true,
      productUpdatesBaseUrl: 'https://logto.io',
    });

    const item1 = makeItem('update-1', '2026-11-18T00:00:00.000Z');
    const item2 = makeItem('update-2', '2026-11-22T00:00:00.000Z');
    mockFetch.mockResolvedValue({ ok: true, json: async () => [item1, item2] });

    const tenantA = makeTenant('tenant-a', false);
    const tenantB = makeTenant('tenant-b', false);
    const suspendedTenant = makeTenant('tenant-c', true);

    const { rerenderTenant } = renderAppContent(tenantA);

    // Top item appears in Cloud Console
    expect(await screen.findByText(item2.title)).not.toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockCapture).toHaveBeenCalledTimes(1);
    expect(mockCapture).toHaveBeenLastCalledWith('console:update_card_shown', {
      update_id: item2.id,
      language: 'en',
    });

    // Dismiss top card so only item1 remains
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    await waitFor(() => {
      expect(screen.getByText(item1.title)).not.toBeNull();
    });
    expect(mockUpdateCustomData).toHaveBeenCalledTimes(1);
    expect(mockCapture).toHaveBeenCalledTimes(3);

    // Switch to tenant B: subscription data briefly loads (AppLoading), then resolves
    mockSubscription(true);
    rerenderTenant(tenantB);
    expect(screen.getByTestId('app-loading')).not.toBeNull();
    expect(screen.queryByRole('region', { name: 'Product updates' })).toBeNull();

    mockSubscription(false);
    rerenderTenant(tenantB);
    expect(screen.getByTestId('outlet-page')).not.toBeNull();
    expect(screen.getByText(item1.title)).not.toBeNull();
    expect(screen.queryByText(item2.title)).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    // No duplicate shown impression for item1 after tenant switch
    expect(mockCapture).toHaveBeenCalledTimes(3);

    // Switch to suspended tenant: cards stay hidden over TenantSuspendedPage
    rerenderTenant(suspendedTenant);
    expect(screen.getByTestId('tenant-suspended')).not.toBeNull();
    expect(screen.queryByRole('region', { name: 'Product updates' })).toBeNull();

    // Switch back to healthy tenant: remaining item1 reappears without re-fetching or duplicating shown event
    rerenderTenant(tenantB);
    expect(screen.getByText(item1.title)).not.toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockCapture).toHaveBeenCalledTimes(3);
  });
});
