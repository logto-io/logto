import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';

import Purchase from './Purchase';
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
  useSelfHostedLicenses: () => ({ mutate: mockMutate }),
}));
jest.mock('@/consts/env', () => ({ isCloud: true, isDevFeaturesEnabled: true }));
jest.mock('@/components/Region', () => ({ defaultRegionName: 'US' }));
jest.mock('@/hooks/use-billing-customer-choice', () => ({
  useBillingCustomerChoice: () => ({ chooseBillingCustomer: async () => ({}) }),
}));
jest.mock('./List', () => ({
  __esModule: true,
  default: ({
    onCreate,
    isCreating,
  }: {
    readonly onCreate: () => void;
    readonly isCreating: boolean;
  }) => (
    <button disabled={isCreating} onClick={onCreate}>
      Create license
    </button>
  ),
}));

const mockApi = {
  config: { baseUrl: new URL('https://cloud.example.com') },
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
};
const mockMutate = jest.fn(async () => []);

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
  savePendingPurchase('alice', { key: 'saved-key', customerChoice: {}, sessionId: 'session-one' });
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

it('starts Stripe Checkout directly from Create without showing a purchase card', async () => {
  savePendingPurchase('alice', { key: 'new-key', customerChoice: {} });
  const redirectUri = 'https://checkout.stripe.com/session-one';
  const assign = jest.fn();
  jest.spyOn(window, 'location', 'get').mockReturnValue({ ...window.location, assign });
  mockApi.post.mockResolvedValue({ ...paidSession, status: 'open', redirectUri });
  render(
    <MemoryRouter initialEntries={['/self-hosted-licenses']}>
      <Purchase userId="alice" />
    </MemoryRouter>
  );

  fireEvent.click(screen.getByRole('button', { name: 'Create license' }));

  await waitFor(() => {
    expect(assign).toHaveBeenCalledWith(redirectUri);
  });
  expect(mockApi.post).toHaveBeenCalledTimes(1);
  expect(mockApi.post).toHaveBeenCalledWith('/api/me/self-hosted-licenses/checkout-session', {
    body: { plan: 'self-hosted-pro' },
  });
  expect(screen.getByRole('button', { name: 'Create license' })).toHaveProperty('disabled', true);
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
    '/api/me/self-hosted-licenses/checkout-session/:sessionId',
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
