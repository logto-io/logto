import { type userSubscriptionsRouter } from '@logto/cloud/routes';
import { useState } from 'react';

import { toastResponseError, useCloudApi } from '@/cloud/hooks/use-cloud-api';
import Button from '@/ds-components/Button';

type Props = {
  readonly subscriptionId: string;
};

/** Personal subscriptions can bill different Stripe customers, so each opens its own portal. */
function ManagePaymentButton({ subscriptionId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const cloudApi = useCloudApi<typeof userSubscriptionsRouter>({ hideErrorToast: true });

  return (
    <Button
      type="text"
      size="small"
      title="general.manage"
      isLoading={isLoading}
      onClick={async () => {
        setIsLoading(true);
        try {
          const { redirectUri } = await cloudApi.post(
            '/api/me/user-subscriptions/:id/stripe-customer-portal',
            {
              params: { id: subscriptionId },
              body: { callbackUrl: window.location.href },
            }
          );
          // eslint-disable-next-line @silverhand/fp/no-mutation -- Stripe's customer portal is an external page
          window.location.href = redirectUri;
        } catch (error: unknown) {
          void toastResponseError(error);
        } finally {
          setIsLoading(false);
        }
      }}
    />
  );
}

export default ManagePaymentButton;
