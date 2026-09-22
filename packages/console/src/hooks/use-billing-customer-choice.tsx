import { type userStripeCustomersRouter } from '@logto/cloud/routes';
import { trySafe } from '@silverhand/essentials';
import { useContext, useRef } from 'react';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type CheckoutCustomerChoice } from '@/cloud/types/router';
import BillingCustomerPicker from '@/components/BillingCustomerPicker';
import { defaultBillingChoice, toCustomerChoice } from '@/components/BillingCustomerPicker/utils';
import { isDevFeaturesEnabled } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';

import { useConfirmModal } from './use-confirm-modal';

/**
 * Lets the user choose which billing Customer pays before Stripe Checkout opens, when the API
 * would honor a choice: a new tenant, or a tenant that has never billed. A user with no linked
 * Customer is never asked; an absent choice means their default Customer.
 */
export const useBillingCustomerChoice = () => {
  const cloudApi = useCloudApi<typeof userStripeCustomersRouter>({ hideErrorToast: true });
  const { currentSubscription } = useContext(SubscriptionDataContext);
  const { show } = useConfirmModal();
  const selected = useRef('');

  /**
   * Resolves to the Checkout body fields for the choice, or `undefined` when the user cancels.
   *
   * @param tenantId The current tenant, whose subscription the context holds; omitted for a
   * tenant that is being created.
   */
  const chooseBillingCustomer = async (
    tenantId?: string
  ): Promise<CheckoutCustomerChoice | undefined> => {
    // Billing Customer picker on Checkout (dev feature)
    if (!isDevFeaturesEnabled) {
      return {};
    }

    // A tenant that has billed before keeps its Customer; an unknown flag is treated the same.
    if (tenantId && currentSubscription.hasBillingCustomer !== false) {
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
  };

  return { chooseBillingCustomer };
};
