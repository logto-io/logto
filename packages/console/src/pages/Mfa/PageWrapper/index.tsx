import { ReservedPlanId } from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import { useContext, type ReactNode } from 'react';

import PageMeta from '@/components/PageMeta';
import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import CardTitle from '@/ds-components/CardTitle';

import styles from './index.module.scss';

type Props = {
  readonly children: ReactNode;
};

function PageWrapper({ children }: Props) {
  const { isDevTenant } = useContext(TenantsContext);
  const {
    currentPlan,
    currentSubscription: { planId },
    currentSubscriptionQuota: { mfaEnabled },
  } = useContext(SubscriptionDataContext);
  const isMfaEnabled =
    !isCloud || (isDevFeaturesEnabled ? mfaEnabled : currentPlan.quota.mfaEnabled);

  return (
    <div className={styles.container}>
      <PageMeta titleKey="mfa.title" />
      <CardTitle
        paywall={
          isDevFeaturesEnabled
            ? cond(planId === ReservedPlanId.Pro && ReservedPlanId.Pro)
            : cond((!isMfaEnabled || isDevTenant) && ReservedPlanId.Pro)
        }
        title="mfa.title"
        subtitle="mfa.description"
        className={styles.cardTitle}
      />
      {children}
    </div>
  );
}

export default PageWrapper;
