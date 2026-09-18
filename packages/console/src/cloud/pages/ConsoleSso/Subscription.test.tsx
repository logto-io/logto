import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';

import EnterpriseSubscriptions from '@/components/Topbar/EnterpriseSubscriptions';
import useCurrentUser from '@/hooks/use-current-user';

import EnterpriseSubscription from '../EnterpriseSubscription';

import SubscriptionLanding from './SubscriptionLanding';

jest.mock('@/ds-components/DynamicT', () => ({
  __esModule: true,
  default: ({ forKey }: { readonly forKey: string }) => <span>{forKey}</span>,
}));

const mockGet = jest.fn();
jest.mock('@/cloud/hooks/use-cloud-api', () => ({ useCloudApi: () => ({ get: mockGet }) }));
jest.mock('@/hooks/use-current-user', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/consts/env', () => ({ isCloud: true, isDevFeaturesEnabled: true }));
jest.mock('@/consts', () => ({
  EnterpriseSubscriptionTabs: { Subscription: 'subscription', BillingHistory: 'billing-history' },
}));
jest.mock('@/contexts/TenantsProvider', () => ({
  GlobalRoute: { EnterpriseSubscription: '/subscriptions' },
}));
jest.mock('@/hooks/use-tenant-pathname', () => ({
  __esModule: true,
  default: () => ({ getTo: (path: string) => path, match: () => false }),
}));
jest.mock('@/components/Topbar', () => ({
  __esModule: true,
  default: () => <div>Account navigation</div>,
}));
jest.mock('@/components/PageMeta', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/FeatureTag', () => ({ CombinedAddOnAndFeatureTag: () => null }));
jest.mock('@/components/LearnMore', () => ({ __esModule: true, default: () => null }));
jest.mock('@/containers/AppBoundary', () => ({
  __esModule: true,
  default: ({ children }: { readonly children: ReactNode }) => <div>{children}</div>,
}));
jest.mock('@/ds-components/OverlayScrollbar', () => ({
  __esModule: true,
  default: ({ children }: { readonly children: ReactNode }) => <div>{children}</div>,
}));

const wrapper = ({ children }: { readonly children: ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>{children}</SWRConfig>
);
const renderSubscription = (path = '/subscriptions') =>
  render(
    <MemoryRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      initialEntries={[path]}
    >
      <Routes>
        <Route path="/subscriptions" element={<EnterpriseSubscription />}>
          <Route index element={<SubscriptionLanding />} />
          <Route path="console-sso" element={<div>Connector list</div>} />
          <Route path=":logtoEnterpriseId/subscription" element={<div>Enterprise plan</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
    { wrapper }
  );

beforeEach(() => {
  jest.clearAllMocks();
  jest
    .mocked(useCurrentUser)
    .mockReturnValue({ user: { id: 'alice' } } as ReturnType<typeof useCurrentUser>);
});

it('exposes the global entry to a user with no Enterprise plan', () => {
  mockGet.mockResolvedValue({ logtoEnterprises: [] });
  const open = jest.spyOn(window, 'open').mockImplementation(() => null);
  render(
    <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <EnterpriseSubscriptions />
    </MemoryRouter>,
    { wrapper }
  );
  fireEvent.click(screen.getByText('topbar.subscription'));
  expect(open).toHaveBeenCalledWith('/subscriptions');
  open.mockRestore();
});

it.each(['/subscriptions', '/subscriptions/console-sso'])(
  'opens %s without a paid tenant and retains a single Console SSO tab',
  async (path) => {
    mockGet.mockResolvedValue({ logtoEnterprises: [] });
    renderSubscription(path);
    await screen.findByText('Connector list');
    expect(screen.getByRole('tab', { name: 'console_sso.title' })).toBeTruthy();
    expect(
      screen.queryByRole('tab', { name: 'enterprise_subscription.tab.subscription' })
    ).toBeNull();
    expect(
      screen.queryByRole('tab', { name: 'enterprise_subscription.tab.billing_history' })
    ).toBeNull();
  }
);

it('retains the Enterprise subscription and billing tabs alongside Console SSO', async () => {
  mockGet.mockResolvedValue({ logtoEnterprises: [{ id: 'enterprise-a' }] });
  renderSubscription();
  await screen.findByText('Enterprise plan');
  await waitFor(() => {
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });
  fireEvent.click(screen.getByRole('tab', { name: 'console_sso.title' }));
  expect(screen.getByText('Connector list')).toBeTruthy();
});

it('does not expose Enterprise content just because an enterprise ID appears in the URL', async () => {
  mockGet.mockResolvedValue({ logtoEnterprises: [] });
  renderSubscription('/subscriptions/not-owned/subscription');
  await screen.findByText('Connector list');
  expect(
    screen.queryByRole('tab', { name: 'enterprise_subscription.tab.subscription' })
  ).toBeNull();
});
