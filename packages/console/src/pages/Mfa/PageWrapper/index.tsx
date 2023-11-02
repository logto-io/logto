import { conditional } from '@silverhand/essentials';
import { useContext, type ReactNode } from 'react';

import PageMeta from '@/components/PageMeta';
import ProTag from '@/components/ProTag';
import { TenantsContext } from '@/contexts/TenantsProvider';
import CardTitle from '@/ds-components/CardTitle';
import useSubscriptionPlan from '@/hooks/use-subscription-plan';

import * as styles from './index.module.scss';

type Props = {
  children: ReactNode;
};

function PageWrapper({ children }: Props) {
  const { currentTenantId } = useContext(TenantsContext);
  const { data: currentPlan } = useSubscriptionPlan(currentTenantId);
  // Note: fallback to true for OSS version
  const isMfaEnabled = currentPlan?.quota.mfaEnabled ?? true;

  return (
    <div className={styles.container}>
      <PageMeta titleKey="mfa.title" />
      <CardTitle
        title="mfa.title"
        titleTag={conditional(!isMfaEnabled && <ProTag />)}
        subtitle="mfa.description"
        className={styles.cardTitle}
      />
      {children}
    </div>
  );
}

export default PageWrapper;
