import { act, renderHook } from '@testing-library/react';
import type * as React from 'react';

import useSubscribe from './use-subscribe';

const mockPost = jest.fn();
const mockChooseBillingCustomer = jest.fn();
const mockLocationAssign = jest.fn();

jest.mock('@/cloud/hooks/use-cloud-api', () => ({
  useCloudApi: () => ({ post: mockPost }),
}));

jest.mock('./use-billing-customer-choice', () => ({
  useBillingCustomerChoice: () => ({ chooseBillingCustomer: mockChooseBillingCustomer }),
}));

jest.mock('./use-tenant-pathname', () => ({
  __esModule: true,
  default: () => ({ getUrl: () => new URL('https://console.test/callback') }),
}));

jest.mock('@/contexts/TenantsProvider', () => {
  const { createContext } = jest.requireActual<typeof React>('react');

  return {
    GlobalRoute: { CheckoutSuccessCallback: '/checkout-success-callback' },
    TenantsContext: createContext({ updateTenant: jest.fn() }),
  };
});

jest.mock('@/contexts/SubscriptionDataProvider', () => {
  const { createContext } = jest.requireActual<typeof React>('react');

  return {
    SubscriptionDataContext: createContext({
      mutateSubscriptionQuotaAndUsages: jest.fn(),
      onCurrentSubscriptionUpdated: jest.fn(),
    }),
  };
});

jest.mock('@/utils/checkout', () => ({
  createLocalCheckoutSession: jest.fn(),
}));

const subscribe = async () => {
  const { result } = renderHook(() => useSubscribe());
  return act(async () =>
    result.current.subscribe({ skuId: 'pro', planId: 'pro', tenantId: 'tenant-1' })
  );
};

describe('useSubscribe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      assign: mockLocationAssign,
    });
    mockPost.mockResolvedValue({ redirectUri: 'https://checkout.stripe.test', sessionId: 'cs_1' });
  });

  it('does not open Checkout when the billing Customer dialog is cancelled', async () => {
    // eslint-disable-next-line unicorn/no-useless-undefined -- jest requires the resolved value
    mockChooseBillingCustomer.mockResolvedValue(undefined);

    await expect(subscribe()).resolves.toBe(false);
    expect(mockPost).not.toHaveBeenCalled();
    expect(mockLocationAssign).not.toHaveBeenCalled();
  });

  it('sends the billing Customer choice with the Checkout request', async () => {
    mockChooseBillingCustomer.mockResolvedValue({ customerId: 'cus_other' });

    await expect(subscribe()).resolves.toBe(true);
    const [path, { body }] = mockPost.mock.lastCall as [string, { body: Record<string, unknown> }];
    expect(path).toBe('/api/checkout-session');
    expect(body).toMatchObject({ customerId: 'cus_other', skuId: 'pro', tenantId: 'tenant-1' });
    expect(mockLocationAssign).toHaveBeenCalledWith('https://checkout.stripe.test');
  });
});
