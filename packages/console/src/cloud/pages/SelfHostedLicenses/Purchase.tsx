import { type ReactNode } from 'react';

import Plus from '@/assets/icons/plus.svg?react';
import { useSelfHostedLicenses } from '@/cloud/hooks/use-self-hosted-licenses';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import InlineNotification from '@/ds-components/InlineNotification';
import pageLayout from '@/scss/page-layout.module.scss';

import PurchaseCard from './PurchaseCard';
import { useLicensePurchase } from './use-license-purchase';

type Props = {
  readonly userId: string;
  /** The page title, laid out next to the "Buy a license" action. */
  readonly title: ReactNode;
};

/** Self-serve Self-hosted Pro purchase and the return from Stripe Checkout. */
function Purchase({ userId, title }: Props) {
  const { data: licenses } = useSelfHostedLicenses();
  const { status, isCardOpen, openCard, closeCard, subscribe, retryActivation } =
    useLicensePurchase(userId);
  const hasLicenses = Boolean(licenses?.length);
  const isWaiting = status === 'activating' || status === 'processing';
  // A user may hold several licenses, so buying another sits behind an action once they have one.
  const isCardVisible = licenses !== undefined && !isWaiting && (!hasLicenses || isCardOpen);

  return (
    <>
      <div className={pageLayout.headline}>
        {title}
        {hasLicenses && !isCardVisible && !isWaiting && (
          <Button
            title="cloud.self_hosted_licenses.purchase.buy"
            type="primary"
            size="large"
            icon={<Plus />}
            onClick={openCard}
          />
        )}
      </div>
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
      {isCardVisible && (
        <PurchaseCard
          isSubscribing={status === 'subscribing' || status === 'canceling'}
          onClose={hasLicenses ? closeCard : undefined}
          onSubscribe={() => {
            void subscribe();
          }}
        />
      )}
    </>
  );
}

export default Purchase;
