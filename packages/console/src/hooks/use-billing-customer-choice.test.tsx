import { render, renderHook } from '@testing-library/react';
import type * as React from 'react';

import { type BillingCustomer } from '@/cloud/types/router';
import { type EnvTestUtils, mockEnv, resetMockEnv } from '@/test-utils/env';

import { useBillingCustomerChoice } from './use-billing-customer-choice';

const mockGet = jest.fn();
const mockShow = jest.fn();
const mockPicker = jest.fn();
const mockSubscription = { hasBillingCustomer: undefined as boolean | undefined };

jest.mock('@/consts/env', () => jest.requireActual<EnvTestUtils>('@/test-utils/env').mockEnvModule);

jest.mock('@/cloud/hooks/use-cloud-api', () => ({
  useCloudApi: () => ({ get: mockGet }),
}));

jest.mock('./use-confirm-modal', () => ({
  useConfirmModal: () => ({ show: mockShow }),
}));

jest.mock('@/contexts/SubscriptionDataProvider', () => {
  const { createContext } = jest.requireActual<typeof React>('react');

  return {
    // A getter: the factory runs while the hook module loads, before `mockSubscription` initializes.
    SubscriptionDataContext: createContext({
      get currentSubscription() {
        return mockSubscription;
      },
    }),
  };
});

jest.mock('@/components/BillingCustomerPicker', () => ({
  __esModule: true,
  default: (props: unknown) => {
    mockPicker(props);
    return null;
  },
}));

const customer = (customerId: string, isDefault: boolean): BillingCustomer => ({
  customerId,
  isDefault,
  createdAt: new Date(0),
});

const choose = async (tenantId?: string) => {
  const { result } = renderHook(() => useBillingCustomerChoice());
  return result.current.chooseBillingCustomer(tenantId);
};

describe('useBillingCustomerChoice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetMockEnv();
    mockEnv({ isDevFeaturesEnabled: true });
    // eslint-disable-next-line @silverhand/fp/no-mutation -- test state
    mockSubscription.hasBillingCustomer = undefined;
    mockGet.mockResolvedValue([customer('cus_default', true)]);
    mockShow.mockResolvedValue([true]);
  });

  it('sends nothing without asking when dev features are off', async () => {
    mockEnv({ isDevFeaturesEnabled: false });

    await expect(choose()).resolves.toEqual({});
    expect(mockGet).not.toHaveBeenCalled();
    expect(mockShow).not.toHaveBeenCalled();
  });

  it.each([true, undefined])(
    'sends nothing for a tenant whose billing Customer flag is %s',
    async (hasBillingCustomer) => {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- test state
      mockSubscription.hasBillingCustomer = hasBillingCustomer;

      await expect(choose('tenant-1')).resolves.toEqual({});
      expect(mockGet).not.toHaveBeenCalled();
      expect(mockShow).not.toHaveBeenCalled();
    }
  );

  it('sends nothing without asking when the caller has no Customer', async () => {
    mockGet.mockResolvedValue([]);

    await expect(choose()).resolves.toEqual({});
    expect(mockShow).not.toHaveBeenCalled();
  });

  it('sends nothing without asking when the list cannot be read', async () => {
    mockGet.mockRejectedValue(new Error('unavailable'));

    await expect(choose()).resolves.toEqual({});
    expect(mockShow).not.toHaveBeenCalled();
  });

  it('asks for a new tenant even when the current tenant bills', async () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- test state
    mockSubscription.hasBillingCustomer = true;

    await expect(choose()).resolves.toEqual({});
    expect(mockShow).toHaveBeenCalledTimes(1);
  });

  it('sends the Customer picked in the dialog', async () => {
    mockGet.mockResolvedValue([customer('cus_default', true), customer('cus_other', false)]);
    mockShow.mockImplementation(async ({ ModalContent }: { ModalContent: () => JSX.Element }) => {
      render(<ModalContent />);
      const [{ onChange }] = mockPicker.mock.lastCall as [{ onChange: (value: string) => void }];
      onChange('cus_other');
      return [true];
    });

    await expect(choose()).resolves.toEqual({ customerId: 'cus_other' });
  });

  it('asks for a tenant that has never billed', async () => {
    // eslint-disable-next-line @silverhand/fp/no-mutation -- test state
    mockSubscription.hasBillingCustomer = false;

    await expect(choose('tenant-1')).resolves.toEqual({});
    expect(mockShow).toHaveBeenCalledTimes(1);
  });

  it('asks for a new Customer when the list has no default', async () => {
    mockGet.mockResolvedValue([customer('cus_other', false)]);

    await expect(choose()).resolves.toEqual({ newCustomer: true });
  });

  it('resolves to nothing when the user cancels', async () => {
    mockShow.mockResolvedValue([false]);

    await expect(choose()).resolves.toBeUndefined();
  });
});
