import { type BillingCustomer } from '@/cloud/types/router';

import { defaultBillingChoice, newBillingCustomer, toCustomerChoice } from './utils';

const customer = (customerId: string, isDefault: boolean): BillingCustomer => ({
  customerId,
  isDefault,
  createdAt: new Date(0),
});

const customers = [customer('cus_default', true), customer('cus_other', false)];

describe('defaultBillingChoice', () => {
  it('preselects the default Customer', () => {
    expect(defaultBillingChoice(customers)).toBe('cus_default');
  });

  it('preselects a new account when the list has no default', () => {
    expect(defaultBillingChoice([customer('cus_other', false)])).toBe(newBillingCustomer);
  });
});

describe('toCustomerChoice', () => {
  it('sends nothing for the default Customer', () => {
    expect(toCustomerChoice('cus_default', 'cus_default')).toEqual({});
  });

  it('sends the id of another Customer', () => {
    expect(toCustomerChoice('cus_default', 'cus_other')).toEqual({ customerId: 'cus_other' });
  });

  it('asks for a new Customer', () => {
    expect(toCustomerChoice('cus_default', newBillingCustomer)).toEqual({ newCustomer: true });
  });
});
