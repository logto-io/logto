import { cond } from '@silverhand/essentials';
import { useContext, type ReactNode } from 'react';

import PageMeta from '@/components/PageMeta';
import { latestProPlanId } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import CardTitle from '@/ds-components/CardTitle';
import { isPaidPlan } from '@/utils/subscription';

import styles from './index.module.scss';

type Props = {
  readonly children: ReactNode;
};

function PageWrapper({ children }: Props) {
  const {
    currentSubscription: { planId, isEnterprisePlan },
    currentSubscriptionQuota: { mfaEnabled },
  } = useContext(SubscriptionDataContext);

  const isPaidTenant = isPaidPlan(planId, isEnterprisePlan);

  return (
    <div className={styles.container}>
      <PageMeta titleKey="mfa.title" />
      <CardTitle
        paywall={cond(!isPaidTenant && latestProPlanId)}
        hasAddOnTag={isPaidPlan(planId, isEnterprisePlan)}
        title="mfa.title"
        subtitle="mfa.description"
        className={styles.cardTitle}
      />
      {children}
    </div>
  );
}

export default PageWrapper;
