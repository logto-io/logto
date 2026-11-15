import DynamicT from '@/ds-components/DynamicT';
import InlineNotification from '@/ds-components/InlineNotification';

import List from './List';
import { useLicensePurchase } from './use-license-purchase';

type Props = {
  readonly userId: string;
};

/** Self-serve Self-hosted Pro purchase and the return from Stripe Checkout. */
function Purchase({ userId }: Props) {
  const { status, subscribe, retryActivation } = useLicensePurchase(userId);

  return (
    <List
      isCreating={status !== 'idle'}
      onCreate={() => {
        void subscribe();
      }}
    >
      {status === 'activating' && (
        <InlineNotification severity="info">
          <DynamicT forKey="cloud.self_hosted_licenses.purchase.activating" />
        </InlineNotification>
      )}
      {status === 'processing' && (
        <InlineNotification
          severity="alert"
          action="general.retry"
          onClick={() => {
            void retryActivation();
          }}
        >
          <DynamicT forKey="cloud.self_hosted_licenses.purchase.processing" />
        </InlineNotification>
      )}
    </List>
  );
}

export default Purchase;
