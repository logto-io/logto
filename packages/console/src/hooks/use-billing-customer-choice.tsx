import { type userStripeCustomersRouter } from '@logto/cloud/routes';
import { trySafe } from '@silverhand/essentials';
import { useCallback, useRef } from 'react';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type CheckoutCustomerChoice, type Subscription } from '@/cloud/types/router';
import BillingCustomerPicker from '@/components/BillingCustomerPicker';
import { defaultBillingChoice, toCustomerChoice } from '@/components/BillingCustomerPicker/utils';

import { useConfirmModal } from './use-confirm-modal';

/**
 * Lets the user choose which billing Customer pays before Stripe Checkout opens, when the API
 * would honor a choice: a purchase without a tenant (a new tenant or a personal subscription), or
 * a tenant that has never billed. A user with no linked Customer is never asked; an absent choice
 * means their default Customer.
 */
export const useBillingCustomerChoice = () => {
  const cloudApi = useCloudApi<typeof userStripeCustomersRouter>({ hideErrorToast: true });
  const { show } = useConfirmModal();
  const selected = useRef('');

  /**
   * Resolves to the Checkout body fields for the choice, or `undefined` when the user cancels.
   * Stable across renders, so callers can list it as a dependency.
   *
   * @param tenantSubscription The subscription of the tenant being billed; omitted for a purchase
   * without a tenant.
   */
  const chooseBillingCustomer = useCallback(
    async (
      tenantSubscription?: Pick<Subscription, 'hasBillingCustomer'>
    ): Promise<CheckoutCustomerChoice | undefined> => {
      // A tenant that has billed before keeps its Customer; an unknown flag is treated the same.
      if (tenantSubscription && tenantSubscription.hasBillingCustomer !== false) {
        return {};
      }

      // An unreadable list is not an error: nothing is sent and the default Customer applies.
      const customers =
        (await trySafe(
          async () => cloudApi.get('/api/me/stripe-customers'),
          (error) => {
            console.warn('Failed to read the billing Customers; the default one applies.', error);
          }
        )) ?? [];

      if (customers.length === 0) {
        return {};
      }

      const initial = defaultBillingChoice(customers);
      // eslint-disable-next-line @silverhand/fp/no-mutation -- React ref assignment
      selected.current = initial;

      const [confirmed] = await show({
        ModalContent: () => (
          <BillingCustomerPicker
            customers={customers}
            defaultValue={initial}
            onChange={(value) => {
              // eslint-disable-next-line @silverhand/fp/no-mutation -- React ref assignment
              selected.current = value;
            }}
          />
        ),
        title: 'subscription.billing_customer_modal.title',
        confirmButtonText: 'general.continue',
        confirmButtonType: 'primary',
      });

      return confirmed ? toCustomerChoice(initial, selected.current) : undefined;
    },
    [cloudApi, show]
  );

  return { chooseBillingCustomer };
};
