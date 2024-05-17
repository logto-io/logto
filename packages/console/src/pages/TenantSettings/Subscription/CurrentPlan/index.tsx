import { cond } from '@silverhand/essentials';

import { type SubscriptionUsage, type Subscription } from '@/cloud/types/router';
import BillInfo from '@/components/BillInfo';
import ChargeNotification from '@/components/ChargeNotification';
import FormCard from '@/components/FormCard';
import PlanDescription from '@/components/PlanDescription';
import PlanName from '@/components/PlanName';
import PlanUsage from '@/components/PlanUsage';
import FormField from '@/ds-components/FormField';
import { type SubscriptionPlan } from '@/types/subscriptions';
import { hasSurpassedQuotaLimit } from '@/utils/quota';

import MauLimitExceedNotification from './MauLimitExceededNotification';
import PaymentOverdueNotification from './PaymentOverdueNotification';
import * as styles from './index.module.scss';

type Props = {
  readonly subscription: Subscription;
  readonly subscriptionPlan: SubscriptionPlan;
  readonly subscriptionUsage: SubscriptionUsage;
};

function CurrentPlan({ subscription, subscriptionPlan, subscriptionUsage }: Props) {
  const {
    id,
    name,
    quota: { tokenLimit },
  } = subscriptionPlan;

  const hasTokenSurpassedLimit = hasSurpassedQuotaLimit({
    quotaKey: 'tokenLimit',
    usage: subscriptionUsage.tokenUsage,
    plan: subscriptionPlan,
  });

  return (
    <FormCard title="subscription.current_plan" description="subscription.current_plan_description">
      <div className={styles.planInfo}>
        <div className={styles.name}>
          <PlanName name={name} />
        </div>
        <div className={styles.description}>
          <PlanDescription planId={id} />
        </div>
      </div>
      <FormField title="subscription.plan_usage">
        <PlanUsage
          currentSubscription={subscription}
          currentPlan={subscriptionPlan}
          subscriptionUsage={subscriptionUsage}
        />
      </FormField>
      <FormField title="subscription.next_bill">
        <BillInfo
          cost={subscriptionUsage.cost}
          isManagePaymentVisible={Boolean(subscriptionUsage.cost)}
        />
      </FormField>
      <MauLimitExceedNotification
        activeUsers={subscriptionUsage.activeUsers}
        currentPlan={subscriptionPlan}
        className={styles.notification}
      />
      <ChargeNotification
        hasSurpassedLimit={hasTokenSurpassedLimit}
        quotaItemPhraseKey="tokens"
        checkedFlagKey="token"
        className={styles.notification}
        quotaLimit={cond(typeof tokenLimit === 'number' && tokenLimit)}
      />
      <PaymentOverdueNotification className={styles.notification} />
    </FormCard>
  );
}

export default CurrentPlan;
