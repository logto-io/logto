import { cond } from '@silverhand/essentials';
import { useContext } from 'react';

import { type SubscriptionUsage, type Subscription } from '@/cloud/types/router';
import BillInfo from '@/components/BillInfo';
import ChargeNotification from '@/components/ChargeNotification';
import FormCard from '@/components/FormCard';
import PlanDescription from '@/components/PlanDescription';
import PlanName from '@/components/PlanName';
import PlanUsage from '@/components/PlanUsage';
import { isDevFeaturesEnabled } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import FormField from '@/ds-components/FormField';
import { type SubscriptionPlan } from '@/types/subscriptions';
import { hasSurpassedQuotaLimit, hasSurpassedSubscriptionQuotaLimit } from '@/utils/quota';

import MauLimitExceedNotification from './MauLimitExceededNotification';
import PaymentOverdueNotification from './PaymentOverdueNotification';
import styles from './index.module.scss';

type Props = {
  /** @deprecated */
  readonly subscription: Subscription;
  /** @deprecated */
  readonly subscriptionPlan: SubscriptionPlan;
  /** @deprecated */
  readonly subscriptionUsage: SubscriptionUsage;
};

function CurrentPlan({ subscription, subscriptionPlan, subscriptionUsage }: Props) {
  const { currentSku, currentSubscriptionUsage, currentSubscriptionQuota } =
    useContext(SubscriptionDataContext);
  const {
    id,
    name,
    quota: { tokenLimit },
  } = subscriptionPlan;

  const hasTokenSurpassedLimit = isDevFeaturesEnabled
    ? hasSurpassedSubscriptionQuotaLimit({
        quotaKey: 'tokenLimit',
        usage: currentSubscriptionUsage.tokenLimit,
        quota: currentSubscriptionQuota,
      })
    : hasSurpassedQuotaLimit({
        quotaKey: 'tokenLimit',
        usage: subscriptionUsage.tokenUsage,
        plan: subscriptionPlan,
      });

  return (
    <FormCard title="subscription.current_plan" description="subscription.current_plan_description">
      <div className={styles.planInfo}>
        <div className={styles.name}>
          <PlanName skuId={currentSku.id} name={name} />
        </div>
        <div className={styles.description}>
          <PlanDescription skuId={currentSku.id} planId={id} />
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
        {/* TODO: update the value once https://github.com/logto-io/cloud/pull/830 is merged. */}
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
        quotaLimit={
          cond(
            isDevFeaturesEnabled &&
              typeof currentSubscriptionQuota.tokenLimit === 'number' &&
              currentSubscriptionQuota.tokenLimit
          ) ?? cond(typeof tokenLimit === 'number' && tokenLimit)
        }
      />
      <PaymentOverdueNotification className={styles.notification} />
    </FormCard>
  );
}

export default CurrentPlan;
