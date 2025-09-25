import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { addOnPricingExplanationLink } from '@/consts/external-links';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import InlineNotification from '@/ds-components/InlineNotification';
import TextLink from '@/ds-components/TextLink';
import useUserPreferences from '@/hooks/use-user-preferences';
import { isPaidPlan } from '@/utils/subscription';

type Props = {
  readonly className?: string;
};

function AddOnUsageChangesNotification({ className }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    currentSku: { unitPrice },
    currentSubscription: { planId, isEnterprisePlan },
  } = useContext(SubscriptionDataContext);
  const {
    data: { addOnChangesInCurrentCycleNoticeAcknowledged },
    update,
  } = useUserPreferences();

  const isPaidTenant = isPaidPlan(planId, isEnterprisePlan);

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  if (!isPaidTenant || addOnChangesInCurrentCycleNoticeAcknowledged || !unitPrice) {
    return null;
  }

  return (
    <InlineNotification
      action="general.got_it"
      className={className}
      onClick={() => {
        void update({ addOnChangesInCurrentCycleNoticeAcknowledged: true });
      }}
    >
      <Trans
        components={{
          a: <TextLink to={addOnPricingExplanationLink} />,
        }}
      >
        {t('subscription.usage.pricing.add_on_changes_in_current_cycle_notice', {
          price: unitPrice / 100,
        })}
      </Trans>
    </InlineNotification>
  );
}

export default AddOnUsageChangesNotification;
