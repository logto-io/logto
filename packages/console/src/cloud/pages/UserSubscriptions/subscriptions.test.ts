import phrases from '@logto/phrases';
import { render, screen, waitFor } from '@testing-library/react';
import i18next from 'i18next';
import { createElement, type ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { useSubscriptionEntry, useUserSubscriptions } from '@/cloud/hooks/use-user-subscriptions';
import { type LogtoEnterpriseResponse } from '@/cloud/types/router';
import EnterpriseSubscriptions from '@/components/Topbar/EnterpriseSubscriptions';

import UserSubscriptions from '.';
import BillingHistory from './BillingHistory';
import PersonalSubscriptions from './PersonalSubscriptions';
import Subscription from './Subscription';

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
  // Billing history has its own coverage; keep it empty for the subscription views.
  useUserSubscriptionInvoices: () => ({ data: { invoices: [], totalCount: 0 } }),
  useEnterpriseInvoices: () => ({ data: [] }),
}));
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

const renderPage = (tab: string) =>
  render(
    createElement(
      MemoryRouter,
      {
        initialEntries: [`/subscriptions/${tab}`],
        future: { v7_startTransition: true, v7_relativeSplatPath: true },
      },
      createElement(
        SWRConfig,
        {
          value: { provider: () => new Map(), shouldRetryOnError: false, dedupingInterval: 0 },
        },
        createElement(
          Routes,
          null,
          createElement(
            Route,
            { path: '/subscriptions', element: createElement(UserSubscriptions) },
            createElement(Route, { path: 'subscription', element: createElement(Subscription) }),
            createElement(Route, {
              path: 'billing-history',
              element: createElement(BillingHistory),
            })
          )
        )
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
});

it('shows the recurring unit list price with a short pricing note', () => {
  renderView(createElement(PersonalSubscriptions));
  expect(screen.getByText('Console SSO')).toBeTruthy();
  expect(screen.queryByText('sub-sso')).toBeNull();
  expect(screen.getByText('2 × $128.00')).toBeTruthy();
  expect(screen.getByText('/ month')).toBeTruthy();
  expect(screen.queryByText(/\$256/)).toBeNull();
  expect(screen.getByText('Active')).toBeTruthy();
  expect(screen.queryByText('Console SSO connectors')).toBeNull();
  expect(
    screen.getByText(
      'Prices exclude taxes and discounts. Changes are prorated on your next invoice.'
    )
  ).toBeTruthy();
  expect(screen.queryByText(/Payment is overdue/)).toBeNull();
});

it('shows only the unit price for a single-unit subscription', () => {
  jest.mocked(useUserSubscriptions).mockReturnValue({
    data: [
      {
        ...subscription,
        product: 'self-hosted-license',
        items: [{ id: 'item', quantity: 1, price: { ...price, interval: 'year' } }],
      },
    ],
    isLoading: false,
    mutate,
  } as unknown as ReturnType<typeof useUserSubscriptions>);
  renderView(createElement(PersonalSubscriptions));
  expect(screen.getByText('$128.00')).toBeTruthy();
  expect(screen.getByText('/ year')).toBeTruthy();
  expect(screen.queryByText(/×/)).toBeNull();
});

it('keeps canceled and unknown-product history', () => {
  jest.mocked(useUserSubscriptions).mockReturnValue({
    data: [
      subscription,
      { ...subscription, id: 'sub-history', status: 'canceled' },
      { ...subscription, id: 'unknown', product: null },
    ],
    isLoading: false,
    mutate,
  } as unknown as ReturnType<typeof useUserSubscriptions>);
  renderView(createElement(PersonalSubscriptions));
  expect(screen.getByText('Canceled')).toBeTruthy();
  expect(screen.getByText('Other subscription')).toBeTruthy();
});

it.each([
  ['console-sso', 'past_due', true],
  ['self-hosted-license', 'unpaid', true],
  ['console-sso', 'canceled', false],
  ['self-hosted-license', 'active', false],
])('warns about overdue payment for a %s subscription in %s: %s', (product, status, isShown) => {
  jest.mocked(useUserSubscriptions).mockReturnValue({
    data: [{ ...subscription, product, status }],
    isLoading: false,
    mutate,
  } as unknown as ReturnType<typeof useUserSubscriptions>);
  renderView(createElement(PersonalSubscriptions));
  expect(Boolean(screen.queryByText(/Payment is overdue/))).toBe(isShown);
});

it('shows the original Enterprise plan card for the first Enterprise above personal subscriptions', async () => {
  jest.mocked(useSubscriptionEntry).mockReturnValue({
    enterprises: { data: [enterprise, { id: 'other', name: 'Other Enterprise' }] },
    hasSubscriptions: true,
  } as unknown as ReturnType<typeof useSubscriptionEntry>);
  get.mockResolvedValue({ quotaScope: 'dedicated', regionNames: [] });
  renderPage('subscription');
  await waitFor(() => {
    expect(get).toHaveBeenCalledTimes(1);
  });
  expect(get).toHaveBeenCalledWith('/api/me/logto-enterprises/:id', {
    params: { id: 'contract' },
    search: { includeSharedQuota: 'true', includeSkuItems: 'true', includeUsages: 'true' },
  });
  const enterprisePlan = screen.getByText('Enterprise Plan');
  const personalSubscriptions = screen.getByText('Personal subscriptions');
  expect(enterprisePlan.compareDocumentPosition(personalSubscriptions)).toBe(
    Node.DOCUMENT_POSITION_FOLLOWING
  );
  expect(screen.queryByText('Other Enterprise')).toBeNull();
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

it.each([
  ['subscription', 'Personal subscriptions', /^Price$/],
  ['billing-history', 'Personal subscriptions', /Select an invoice to view it/],
])('shows only the %s tab content on the global Subscription page', (tab, title, content) => {
  jest.mocked(useSubscriptionEntry).mockReturnValue({
    enterprises: { data: [] },
    hasSubscriptions: true,
  } as unknown as ReturnType<typeof useSubscriptionEntry>);
  renderPage(tab);
  expect(screen.getByText('Subscription')).toBeTruthy();
  expect(screen.getByText('Billing history')).toBeTruthy();
  expect(screen.getByText(title)).toBeTruthy();
  expect(screen.getByText(content)).toBeTruthy();
  if (tab === 'subscription') {
    expect(screen.queryByText(/Select an invoice to view it/)).toBeNull();
  } else {
    expect(screen.queryByText(/^Price$/)).toBeNull();
  }
});
