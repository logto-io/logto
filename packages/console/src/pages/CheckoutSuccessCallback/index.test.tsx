import { act, fireEvent, render, screen } from '@testing-library/react';
import type * as React from 'react';
import { MemoryRouter } from 'react-router-dom';
import useSWR from 'swr';

import { checkoutStateQueryKey } from '@/consts/subscriptions';
import { clearLocalCheckoutSession } from '@/utils/checkout';

import CheckoutSuccessCallback from '.';

const mockNavigate = jest.fn();
const mockMutateSession = jest.fn();
const mockMutateSubscription = jest.fn();
const mockToastSuccess = jest.fn();
const mockToastError = jest.fn();

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('react-hot-toast', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

jest.mock('@/cloud/hooks/use-cloud-api', () => ({
  useCloudApi: () => ({ get: jest.fn() }),
}));

jest.mock('@/hooks/use-tenant-pathname', () => ({
  __esModule: true,
  default: () => ({ navigate: mockNavigate }),
}));

jest.mock('@/contexts/TenantsProvider', () => {
  const { createContext } = jest.requireActual<typeof React>('react');

  return {
    TenantsContext: createContext({
      currentTenantId: 'tenant-1',
      navigateTenant: jest.fn(),
      updateTenant: jest.fn(),
    }),
  };
});

jest.mock('@/contexts/SubscriptionDataProvider', () => {
  const { createContext } = jest.requireActual<typeof React>('react');

  return {
    SubscriptionDataContext: createContext({ onCurrentSubscriptionUpdated: jest.fn() }),
  };
});

jest.mock('@/components/AppLoading', () => ({
  __esModule: true,
  default: () => <div>loading</div>,
}));

jest.mock('@/components/SkuName', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/components/Conversion/utils', () => ({
  GtagConversionId: { PurchaseProPlan: 'purchase', CreateProductionTenant: 'create' },
  reportToGoogle: jest.fn(),
}));

jest.mock('@/utils/checkout', () => ({
  getLocalCheckoutSession: () => ({ state: 'state-1', sessionId: 'cs_test' }),
  clearLocalCheckoutSession: jest.fn(),
}));

const mockedUseSWR = jest.mocked(useSWR);
const mockedClearLocalCheckoutSession = jest.mocked(clearLocalCheckoutSession);

const openSession = { tenantId: 'tenant-1', skuId: 'sku-pro', status: 'open' };
const completeSession = { ...openSession, status: 'complete' };
const proSubscription = { planId: 'sku-pro' };

const sessionKey = '/api/checkout-session/cs_test';
const subscriptionKey = '/api/tenants/tenant-1/subscription';

const stubSwr = (session: Record<string, unknown>, subscription?: Record<string, unknown>) => {
  const responses: Record<string, { data?: unknown; mutate: jest.Mock }> = {
    [sessionKey]: { data: session, mutate: mockMutateSession },
    [subscriptionKey]: { data: subscription, mutate: mockMutateSubscription },
  };
  mockedUseSWR.mockImplementation(((key: unknown) =>
    typeof key === 'string' ? responses[key] : undefined) as unknown as typeof useSWR);
};

/** `refreshInterval` of the last render's two polls: checkout session, then tenant subscription. */
const swrIntervals = () =>
  mockedUseSWR.mock.calls
    .slice(-2)
    .map((call) => (call[2] as { refreshInterval?: number } | undefined)?.refreshInterval);

const renderPage = () => (
  <MemoryRouter
    future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
    initialEntries={[`/checkout-success?${checkoutStateQueryKey}=state-1`]}
  >
    <CheckoutSuccessCallback />
  </MemoryRouter>
);

describe('CheckoutSuccessCallback', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('completes when the session and subscription match', () => {
    stubSwr(completeSession, proSubscription);

    render(renderPage());

    expect(mockedClearLocalCheckoutSession).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
  });

  it('keeps the local session and shows pending on timeout', () => {
    stubSwr(openSession);

    render(renderPage());
    act(() => {
      jest.advanceTimersByTime(60_000 - 1);
    });

    expect(screen.getByText('loading')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(screen.getByText('admin_console.subscription.subscription_check_pending')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'admin_console.general.retry' })).toBeTruthy();
    expect(swrIntervals()).toEqual([0, 0]);
    expect(mockedClearLocalCheckoutSession).not.toHaveBeenCalled();
    expect(mockToastError).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('rechecks, resumes polling and restarts the timer on try again', () => {
    stubSwr(openSession);

    const { rerender } = render(renderPage());
    act(() => {
      jest.advanceTimersByTime(60_000);
    });
    fireEvent.click(screen.getByRole('button', { name: 'admin_console.general.retry' }));

    expect(screen.getByText('loading')).toBeTruthy();
    expect(mockMutateSession).toHaveBeenCalledTimes(1);
    expect(mockMutateSubscription).not.toHaveBeenCalled();
    expect(swrIntervals()).toEqual([1000, 1000]);

    act(() => {
      jest.advanceTimersByTime(60_000 - 1);
    });

    expect(screen.getByText('loading')).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    fireEvent.click(screen.getByRole('button', { name: 'admin_console.general.retry' }));
    stubSwr(completeSession, proSubscription);
    rerender(renderPage());

    expect(mockedClearLocalCheckoutSession).toHaveBeenCalledTimes(1);
    expect(mockToastSuccess).toHaveBeenCalledTimes(1);
  });
});
