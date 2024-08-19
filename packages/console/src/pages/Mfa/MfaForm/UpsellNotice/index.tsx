import { ReservedPlanId } from '@logto/schemas';
import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { addOnPricingExplanationLink } from '@/consts/external-links';
import { mfaAddOnUnitPrice } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import InlineNotification from '@/ds-components/InlineNotification';
import TextLink from '@/ds-components/TextLink';
import useUserPreferences from '@/hooks/use-user-preferences';

type Props = {
  readonly className?: string;
};

function UpsellNotice({ className }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    currentSubscription: { planId },
  } = useContext(SubscriptionDataContext);
  const {
    data: { mfaUpsellNoticeAcknowledged },
    update,
  } = useUserPreferences();

  if (planId !== ReservedPlanId.Pro || mfaUpsellNoticeAcknowledged) {
    return null;
  }

  return (
    <InlineNotification
      action="general.got_it"
      className={className}
      onClick={() => {
        void update({ mfaUpsellNoticeAcknowledged: true });
      }}
    >
      <Trans
        components={{
          a: <TextLink to={addOnPricingExplanationLink} />,
        }}
      >
        {t('upsell.add_on.mfa_inline_notification', {
          price: mfaAddOnUnitPrice,
          planName: String(t('subscription.pro_plan')),
        })}
      </Trans>
    </InlineNotification>
  );
}

export default UpsellNotice;
