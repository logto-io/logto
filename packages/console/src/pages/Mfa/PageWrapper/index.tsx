import { ReservedPlanId } from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import { useContext, type ReactNode } from 'react';

import PageMeta from '@/components/PageMeta';
import { isCloud } from '@/consts/env';
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
    currentSubscription: { planId, isAddOnAvailable },
    currentSubscriptionQuota: { mfaEnabled },
  } = useContext(SubscriptionDataContext);
  const isMfaEnabled = !isCloud || mfaEnabled || planId === ReservedPlanId.Pro;

  return (
    <div className={styles.container}>
      <PageMeta titleKey="mfa.title" />
      <CardTitle
        paywall={cond((!isMfaEnabled || isDevTenant) && ReservedPlanId.Pro)}
        hasAddOnTag={isAddOnAvailable}
        title="mfa.title"
        subtitle="mfa.description"
        className={styles.cardTitle}
      />
      {children}
    </div>
  );
}

export default PageWrapper;
