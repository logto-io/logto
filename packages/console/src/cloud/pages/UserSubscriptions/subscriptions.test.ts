import phrases from '@logto/phrases';
import { render, screen, waitFor, within } from '@testing-library/react';
import i18next from 'i18next';
import { createElement, type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { SWRConfig } from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { useSubscriptionEntry, useUserSubscriptions } from '@/cloud/hooks/use-user-subscriptions';
import { type LogtoEnterpriseResponse } from '@/cloud/types/router';
import EnterpriseSubscriptions from '@/components/Topbar/EnterpriseSubscriptions';

import { useConsoleSsoConnectors } from '../ConsoleSso/use-console-sso';

import UserSubscriptions from '.';
import EnterpriseCoverage from './EnterpriseCoverage';
import PersonalSubscriptions from './PersonalSubscriptions';

jest.mock('@withtyped/client', () => ({ ResponseError: class extends Error {} }), {
  virtual: true,
});
jest.mock('@/ds-components/Tip', () => ({
  ToggleTip: ({ children }: { children: ReactNode }) => children,
}));
jest.mock('@/ds-components/OverlayScrollbar', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => children,
}));
jest.mock('@/components/Region', () => ({
  __esModule: true,
  defaultRegionName: 'EU',
  default: () => null,
}));
jest.mock('@/consts/env', () => ({
  isCloud: true,
  isDevFeaturesEnabled: true,
  adminEndpoint: 'https://cloud.example.com',
}));

jest.mock('@/cloud/hooks/use-cloud-api', () => ({ useCloudApi: jest.fn() }));
jest.mock('@/cloud/hooks/use-user-subscriptions', () => ({
  useUserSubscriptions: jest.fn(),
  useSubscriptionEntry: jest.fn(),
}));
jest.mock('../ConsoleSso/use-console-sso', () => ({ useConsoleSsoConnectors: jest.fn() }));
jest.mock('@/hooks/use-current-user', () => ({
  __esModule: true,
  default: () => ({ user: { id: 'alice' } }),
}));
jest.mock('@/hooks/use-current-tenant-scopes', () => ({
  __esModule: true,
  default: () => ({ access: { isReadOnly: false } }),
}));
jest.mock('@/hooks/use-theme', () => ({ __esModule: true, default: () => 'light' }));
// The page shell (title, top bar and boundary) is unrelated to which Enterprise is listed.
jest.mock('@/components/Topbar', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/PageMeta', () => ({ __esModule: true, default: () => null }));
jest.mock('@/containers/AppBoundary', () => ({
  __esModule: true,
  default: ({ children }: { children: ReactNode }) => children,
}));

const get = jest.fn();
const mutate = jest.fn();
const price = {
  id: 'price',
  productId: 'product',
  unitAmount: 12_800,
  currency: 'usd',
  interval: 'month',
  intervalCount: 1,
};
const subscription = {
  id: 'sub-sso',
  product: 'console-sso',
  status: 'active',
  items: [{ id: 'item', quantity: 2, price }],
  currentPeriodStart: new Date('2026-10-01'),
  currentPeriodEnd: new Date('2026-11-01'),
  cancelAtPeriodEnd: false,
  cancelAt: null,
  canceledAt: null,
};
const enterprise: Pick<LogtoEnterpriseResponse, 'id' | 'name'> = {
  id: 'contract',
  name: 'Contracted Enterprise',
};
const eligibleEnterprise = { quotaScope: 'shared', subscription: { status: 'active' } };
const renderView = (children: ReactNode) =>
  render(
    createElement(
      MemoryRouter,
      { future: { v7_startTransition: true, v7_relativeSplatPath: true } },
      createElement(
        SWRConfig,
        {
          value: { provider: () => new Map(), shouldRetryOnError: false, dedupingInterval: 0 },
        },
        children
      )
    )
  );

beforeAll(() => {
  i18next.addResourceBundle('en', 'translation', phrases.en.translation, true, true);
});
beforeEach(() => {
  jest.clearAllMocks();
  get.mockResolvedValue({
    quota: { basicQuota: { consoleSsoConnectorLimit: 0 } },
    usages: { consoleSsoConnectorLimit: 0 },
  });
  jest.mocked(useCloudApi).mockReturnValue({ get } as unknown as ReturnType<typeof useCloudApi>);
  jest
    .mocked(useUserSubscriptions)
    .mockReturnValue({ data: [subscription], isLoading: false, mutate } as unknown as ReturnType<
      typeof useUserSubscriptions
    >);
  jest
    .mocked(useConsoleSsoConnectors)
    .mockReturnValue({ data: [], isLoading: false, mutate } as unknown as ReturnType<
      typeof useConsoleSsoConnectors
    >);
});

it('shows the recurring unit list price without an invoice estimate', () => {
  renderView(createElement(PersonalSubscriptions));
  expect(screen.getByText('sub-sso')).toBeTruthy();
  expect(screen.getByText('2 × $128.00')).toBeTruthy();
  expect(screen.getByText('/ month')).toBeTruthy();
  expect(screen.queryByText(/\$256/)).toBeNull();
  expect(screen.getByText('Active')).toBeTruthy();
  expect(screen.queryByText('Your upcoming bill')).toBeNull();
  expect(screen.getByText(/Unit list prices exclude/)).toBeTruthy();
});

it('keeps canceled and unknown-product history and associates connectors only with their subscription', () => {
  jest.mocked(useUserSubscriptions).mockReturnValue({
    data: [
      subscription,
      { ...subscription, id: 'sub-history', status: 'canceled' },
      { ...subscription, id: 'unknown', product: null },
    ],
    isLoading: false,
    mutate,
  } as unknown as ReturnType<typeof useUserSubscriptions>);
  jest.mocked(useConsoleSsoConnectors).mockReturnValue({
    data: [
      {
        id: 'associated',
        stripeUserSubscriptionId: 'sub-sso',
        name: 'OIDC',
        branding: { displayName: 'Paid connector' },
      },
      {
        id: 'unrelated',
        stripeUserSubscriptionId: 'different-subscription',
        name: 'OIDC',
        branding: { displayName: 'Unrelated connector' },
      },
      {
        id: 'enterprise',
        stripeUserSubscriptionId: null,
        name: 'OIDC',
        branding: { displayName: 'Included connector' },
      },
    ],
    isLoading: false,
    mutate,
  } as unknown as ReturnType<typeof useConsoleSsoConnectors>);
  renderView(createElement(PersonalSubscriptions));
  expect(screen.getByText('Canceled')).toBeTruthy();
  expect(screen.getByText('Other subscription')).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Paid connector' }).getAttribute('href')).toBe(
    '/console-sso/associated/connection'
  );
  expect(screen.queryByText('Unrelated connector')).toBeNull();
  expect(screen.queryByText('Included connector')).toBeNull();
  expect(
    within(screen.getByText('sub-history').closest('tr')!).getByText('No connectors')
  ).toBeTruthy();
});

it('does not fabricate an empty connector list when the resource API fails', () => {
  jest.mocked(useConsoleSsoConnectors).mockReturnValue({
    error: new Error('Connectors unavailable'),
    isLoading: false,
    mutate,
  } as unknown as ReturnType<typeof useConsoleSsoConnectors>);
  renderView(createElement(PersonalSubscriptions));
  expect(screen.getByText('sub-sso')).toBeTruthy();
  expect(screen.getByText('Connectors unavailable')).toBeTruthy();
  expect(screen.queryByText('No connectors')).toBeNull();
});

it('does not load SSO resources for subscriptions to other products', () => {
  jest.mocked(useUserSubscriptions).mockReturnValue({
    data: [{ ...subscription, product: 'self-hosted-license' }],
    isLoading: false,
    mutate,
  } as unknown as ReturnType<typeof useUserSubscriptions>);
  renderView(createElement(PersonalSubscriptions));
  expect(jest.mocked(useConsoleSsoConnectors)).toHaveBeenCalledWith(false);
});

it.each([0, null, undefined])(
  'shows the exact contracted allowance %s without assuming a free connector',
  async (limit) => {
    get.mockResolvedValue({
      ...eligibleEnterprise,
      quota: { basicQuota: { consoleSsoConnectorLimit: limit } },
      usages: { consoleSsoConnectorLimit: 2 },
    });
    renderView(createElement(EnterpriseCoverage, { enterprise }));
    await waitFor(() => {
      expect(screen.getByText('Usage: 2')).toBeTruthy();
    });
    expect(
      screen.getByText(
        `Contract allowance: ${limit === null ? 'Unlimited' : limit === undefined ? '—' : '0'}`
      )
    ).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Contracted Enterprise' }).getAttribute('href')).toBe(
      '/subscriptions/contract'
    );
  }
);

it.each([
  { quotaScope: 'dedicated', subscription: { status: 'active' } },
  { quotaScope: 'shared', subscription: { status: 'canceled' } },
  { quotaScope: 'shared', subscription: undefined },
])('shows no Console SSO coverage for an ineligible Enterprise plan %j', async (eligibility) => {
  get.mockResolvedValue({
    ...eligibility,
    quota: { basicQuota: { consoleSsoConnectorLimit: 5 } },
    usages: { consoleSsoConnectorLimit: 1 },
  });
  renderView(createElement(EnterpriseCoverage, { enterprise }));
  await waitFor(() => {
    expect(screen.getByText(/doesn't include a Console SSO allowance/)).toBeTruthy();
  });
  expect(screen.queryByText(/Contract allowance:/)).toBeNull();
  expect(screen.queryByText(/Usage:/)).toBeNull();
  expect(screen.getByRole('link', { name: 'Contracted Enterprise' })).toBeTruthy();
});

it('shows only the first Enterprise, matching Console SSO creation', async () => {
  jest.mocked(useSubscriptionEntry).mockReturnValue({
    enterprises: { data: [enterprise, { id: 'other', name: 'Other Enterprise' }] },
    hasSubscriptions: false,
  } as unknown as ReturnType<typeof useSubscriptionEntry>);
  renderView(createElement(UserSubscriptions));
  await waitFor(() => {
    expect(get).toHaveBeenCalledTimes(1);
  });
  expect(get).toHaveBeenCalledWith('/api/me/logto-enterprises/:id', {
    params: { id: 'contract' },
    search: { includeSharedQuota: 'true', includeUsages: 'true' },
  });
  expect(screen.getByRole('link', { name: 'Contracted Enterprise' })).toBeTruthy();
  expect(screen.queryByText('Other Enterprise')).toBeNull();
});

it('shows Enterprise ownership errors without inventing quota values', async () => {
  get.mockRejectedValue(new Error('Enterprise not found'));
  renderView(createElement(EnterpriseCoverage, { enterprise }));
  await waitFor(() => {
    expect(screen.getByText('Enterprise not found')).toBeTruthy();
  });
  expect(screen.queryByText(/Contract allowance:/)).toBeNull();
});

it.each([
  [[], true, true],
  [[enterprise], false, true],
  [[enterprise], true, true],
  [[], false, false],
])(
  'shows the global Subscription entry for enterprises=%j, personal=%s',
  (enterprises, hasSubscriptions, isVisible) => {
    jest.mocked(useSubscriptionEntry).mockReturnValue({
      enterprises: { data: enterprises },
      hasSubscriptions,
    } as unknown as ReturnType<typeof useSubscriptionEntry>);
    renderView(createElement(EnterpriseSubscriptions));
    if (!isVisible) {
      expect(screen.queryByText('Subscription')).toBeNull();
      return;
    }
    const link = screen.getByRole('link', { name: 'Subscription' });
    expect(link.getAttribute('href')).toBe('/subscriptions');
    expect(link.getAttribute('target')).toBe('_blank');
  }
);
