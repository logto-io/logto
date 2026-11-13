import DynamicT from '@/ds-components/DynamicT';
import InlineNotification from '@/ds-components/InlineNotification';

import PurchaseCard from './PurchaseCard';
import { useLicensePurchase } from './use-license-purchase';

type Props = {
  readonly userId: string;
};

/** Self-serve Self-hosted Pro purchase and the return from Stripe Checkout. */
function Purchase({ userId }: Props) {
  const { status, subscribe, retryActivation } = useLicensePurchase(userId);

  if (status === 'activating') {
    return (
      <InlineNotification severity="info">
        <DynamicT forKey="cloud.self_hosted_licenses.purchase.activating" />
      </InlineNotification>
    );
  }

  if (status === 'processing') {
    return (
      <InlineNotification
        severity="alert"
        action="general.retry"
        onClick={() => {
          void retryActivation();
        }}
      >
        <DynamicT forKey="cloud.self_hosted_licenses.purchase.processing" />
      </InlineNotification>
    );
  }

  // Every Subscribe buys a new license, including for a user who already holds some.
  return (
    <PurchaseCard
      isSubscribing={status === 'subscribing' || status === 'canceling'}
      onSubscribe={() => {
        void subscribe();
      }}
    />
  );
}

export default Purchase;
