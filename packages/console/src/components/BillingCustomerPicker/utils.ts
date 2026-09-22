import { type BillingCustomer, type CheckoutCustomerChoice } from '@/cloud/types/router';

/** The picker value that stands for "New billing account"; Stripe Customer ids are `cus_…`, so it cannot collide. */
export const newBillingCustomer = 'new';

export const defaultBillingChoice = (customers: readonly BillingCustomer[]) =>
  customers.find(({ isDefault }) => isDefault)?.customerId ?? newBillingCustomer;

/** The default Customer is sent as nothing, since an absent choice already means it. */
export const toCustomerChoice = (
  defaultChoice: string,
  selected: string
): CheckoutCustomerChoice => {
  if (selected === newBillingCustomer) {
    return { newCustomer: true };
  }

  return selected === defaultChoice ? {} : { customerId: selected };
};
