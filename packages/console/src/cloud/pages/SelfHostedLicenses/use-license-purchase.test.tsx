import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';

import List from './List';
import { readPendingPurchase, savePendingPurchase } from './purchase-storage';
import { useLicensePurchase } from './use-license-purchase';

jest.mock(
  '@withtyped/client',
  () => ({
    __esModule: true,
    default: class {
      readonly get = mockApi.get;
      readonly post = mockApi.post;
      readonly delete = mockApi.delete;
      constructor(readonly config: unknown) {}
    },
    ResponseError: class extends Error {},
  }),
  { virtual: true }
);
jest.mock('@/cloud/hooks/use-cloud-api', () => ({
  useCloudApi: () => mockApi,
  toastResponseError: jest.fn(),
  tryReadResponseErrorBody: jest.fn(),
}));
jest.mock('@/cloud/hooks/use-self-hosted-licenses', () => ({
  useSelfHostedLicenses: () => mockLicenses(),
}));
jest.mock('@/consts/env', () => ({ isCloud: true, isDevFeaturesEnabled: true }));
jest.mock('@/components/Region', () => ({ defaultRegionName: 'US' }));
jest.mock('@/hooks/use-billing-customer-choice', () => ({
  useBillingCustomerChoice: () => ({ chooseBillingCustomer: async () => ({}) }),
}));
jest.mock('@/components/FeatureTag', () => ({
  CombinedAddOnAndFeatureTag: () => null,
}));
jest.mock('@/components/LearnMore', () => ({ __esModule: true, default: () => null }));
// The alias mapper resolves this stylesheet before Jest's generic CSS mapper.
jest.mock('@/scss/page-layout.module.scss', () => ({}));
jest.mock('@/hooks/use-tenant-pathname', () => ({
  __esModule: true,
  default: () => ({ getTo: (path: string) => path }),
}));
jest.mock('@/hooks/use-theme', () => ({
  __esModule: true,
  default: () => 'light',
}));
jest.mock('@/ds-components/OverlayScrollbar', () => ({
  __esModule: true,
  default: ({ children }: { readonly children: ReactNode }) => <div>{children}</div>,
}));

const mockApi = {
  config: { baseUrl: new URL('https://cloud.example.com') },
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
};
const mockMutate = jest.fn(async () => []);
const mockLicenses = jest.fn();
const subscribeButtonName = 'admin_console.cloud.self_hosted_licenses.purchase.subscribe';

/** `@types/jest` predates the async fake-timer API that the installed Jest provides. */
const advanceTimersByTimeAsync = async (milliseconds: number) =>
  (
    jest as unknown as { advanceTimersByTimeAsync: (milliseconds: number) => Promise<unknown> }
  ).advanceTimersByTimeAsync(milliseconds);

const paidSession = {
  licenseId: 'license-one',
  sessionId: 'session-one',
  redirectUri: null,
  status: 'payment_received',
};

const renderPurchase = (entry: string) =>
  renderHook(() => ({ purchase: useLicensePurchase('alice'), location: useLocation() }), {
    wrapper: ({ children }: { readonly children: ReactNode }) => (
      <MemoryRouter initialEntries={[entry]}>{children}</MemoryRouter>
    ),
  });

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  mockLicenses.mockReturnValue({ data: [], isLoading: false, mutate: mockMutate });
  savePendingPurchase('alice', { key: 'saved-key', customerChoice: {}, sessionId: 'session-one' });
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

it('starts Stripe Checkout directly from the empty placeholder Subscribe button', async () => {
  savePendingPurchase('alice', { key: 'new-key', customerChoice: {} });
  const redirectUri = 'https://checkout.stripe.com/session-one';
  const assign = jest.fn();
  jest.spyOn(window, 'location', 'get').mockReturnValue({ ...window.location, assign });
  mockApi.post.mockResolvedValue({ ...paidSession, status: 'open', redirectUri });
  render(
    <MemoryRouter initialEntries={['/self-hosted-licenses']}>
      <List userId="alice" />
    </MemoryRouter>
  );

  const button = screen.getByRole('button', { name: subscribeButtonName });
  expect(button.closest('td')).not.toBeNull();
  fireEvent.click(button);

  await waitFor(() => {
    expect(assign).toHaveBeenCalledWith(redirectUri);
  });
  expect(mockApi.post).toHaveBeenCalledTimes(1);
  expect(mockApi.post).toHaveBeenCalledWith(
    '/api/me/self-hosted-license-purchase/checkout-session',
    {
      body: { plan: 'self-hosted-pro' },
    }
  );
  expect(button).toHaveProperty('disabled', true);
});

it('shows Subscribe only in the header when licenses exist', () => {
  mockLicenses.mockReturnValue({
    data: [{ id: 'license-one', plan: 'self-hosted-pro', status: 'active' }],
    isLoading: false,
    mutate: mockMutate,
  });
  render(
    <MemoryRouter>
      <List userId="alice" />
    </MemoryRouter>
  );

  const button = screen.getByRole('button', { name: subscribeButtonName });
  expect(button.closest('td')).toBeNull();
  expect(screen.queryByText('admin_console.cloud.self_hosted_licenses.empty_title')).toBeNull();
});

it('does not offer Subscribe or handle Checkout returns before the account is ready', () => {
  render(
    <MemoryRouter initialEntries={['/self-hosted-licenses?checkout=success&sessionId=session-one']}>
      <List />
    </MemoryRouter>
  );

  expect(screen.queryByRole('button', { name: subscribeButtonName })).toBeNull();
  expect(mockApi.get).not.toHaveBeenCalled();
});

it('opens the license once Checkout returns and the webhook activates it', async () => {
  mockApi.get.mockImplementation(async (path: string) =>
    path === '/api/me/self-hosted-licenses/:id'
      ? { id: 'license-one', status: 'active' }
      : paidSession
  );
  const { result } = renderPurchase('/self-hosted-licenses?checkout=success&sessionId=session-one');

  await waitFor(() => {
    expect(result.current.location.pathname).toBe('/self-hosted-licenses/license-one');
  });
  expect(readPendingPurchase('alice')).toBeUndefined();
  expect(mockMutate).toHaveBeenCalled();
});

it('keeps the purchase and offers a retry when activation outlasts the timeout', async () => {
  jest.useFakeTimers();
  mockApi.get.mockImplementation(async (path: string) =>
    path === '/api/me/self-hosted-licenses/:id'
      ? { id: 'license-one', status: 'pending' }
      : paidSession
  );
  const { result } = renderPurchase('/self-hosted-licenses?checkout=success&sessionId=session-one');
  expect(result.current.purchase.status).toBe('activating');

  await act(async () => {
    await advanceTimersByTimeAsync(61_000);
  });
  expect(result.current.purchase.status).toBe('processing');
  expect(readPendingPurchase('alice')?.sessionId).toBe('session-one');
  // A reload while waiting resumes the check from the return parameters.
  expect(result.current.location.search).toBe('?checkout=success&sessionId=session-one');

  mockApi.get.mockImplementation(async (path: string) =>
    path === '/api/me/self-hosted-licenses/:id'
      ? { id: 'license-one', status: 'active' }
      : paidSession
  );
  await act(async () => {
    await result.current.purchase.retryActivation();
  });
  expect(result.current.location.pathname).toBe('/self-hosted-licenses/license-one');
});

it('expires the session when the user leaves Checkout, and keeps other parameters', async () => {
  mockApi.delete.mockResolvedValue({ ...paidSession, status: 'expired' });
  const { result } = renderPurchase('/self-hosted-licenses?checkout=cancel&utm_source=email');

  await waitFor(() => {
    expect(result.current.location.search).toBe('?utm_source=email');
  });
  expect(mockApi.delete).toHaveBeenCalledWith(
    '/api/me/self-hosted-license-purchase/checkout-session/:sessionId',
    { params: { sessionId: 'session-one' } }
  );
  expect(readPendingPurchase('alice')).toBeUndefined();
  expect(result.current.purchase.status).toBe('idle');
});

it('lands a purchase link on the page and keeps the UTM parameters', async () => {
  const { result } = renderPurchase(
    '/self-hosted-licenses?checkout=self-hosted-pro&utm_source=website'
  );

  await waitFor(() => {
    expect(result.current.location.search).toBe('?utm_source=website');
  });
  expect(mockApi.post).not.toHaveBeenCalled();
});
