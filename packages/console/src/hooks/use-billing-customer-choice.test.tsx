import { render, renderHook } from '@testing-library/react';

import { type BillingCustomer, type Subscription } from '@/cloud/types/router';

import { useBillingCustomerChoice } from './use-billing-customer-choice';

const mockGet = jest.fn();
const mockShow = jest.fn();
const mockPicker = jest.fn();

jest.mock('@/cloud/hooks/use-cloud-api', () => ({
  useCloudApi: () => ({ get: mockGet }),
}));

jest.mock('./use-confirm-modal', () => ({
  useConfirmModal: () => ({ show: mockShow }),
}));

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

const choose = async (tenantSubscription?: Pick<Subscription, 'hasBillingCustomer'>) => {
  const { result } = renderHook(() => useBillingCustomerChoice());
  return result.current.chooseBillingCustomer(tenantSubscription);
};

describe('useBillingCustomerChoice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockResolvedValue([customer('cus_default', true)]);
    mockShow.mockResolvedValue([true]);
  });

  it.each([true, undefined])(
    'sends nothing for a tenant whose billing Customer flag is %s',
    async (hasBillingCustomer) => {
      await expect(choose({ hasBillingCustomer })).resolves.toEqual({});
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

  it('asks for a purchase without a tenant', async () => {
    await expect(choose()).resolves.toEqual({});
    expect(mockGet).toHaveBeenCalledWith('/api/me/stripe-customers');
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
    await expect(choose({ hasBillingCustomer: false })).resolves.toEqual({});
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
