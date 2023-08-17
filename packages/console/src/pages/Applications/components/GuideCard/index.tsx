import { ApplicationType } from '@logto/schemas';
import classNames from 'classnames';
import { Suspense, useContext } from 'react';

import { type Guide, type GuideMetadata } from '@/assets/docs/guides/types';
import ProTag from '@/components/ProTag';
import { isCloud } from '@/consts/env';
import { subscriptionPage } from '@/consts/pages';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import useSubscriptionPlan from '@/hooks/use-subscription-plan';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import * as styles from './index.module.scss';

export type SelectedGuide = {
  target: GuideMetadata['target'];
  id: Guide['id'];
};

type Props = {
  data: Guide;
  onClick: (data: SelectedGuide) => void;
  hasBorder?: boolean;
};

function LogoSkeleton() {
  return <div className={styles.logoSkeleton} />;
}

function GuideCard({ data, onClick, hasBorder }: Props) {
  const { navigate } = useTenantPathname();
  const { currentTenantId } = useContext(TenantsContext);
  const { data: currentPlan } = useSubscriptionPlan(currentTenantId);
  const isM2mDisabled = isCloud && currentPlan?.quota.machineToMachineLimit === 0;
  const isSubscriptionRequired =
    isM2mDisabled && data.metadata.target === ApplicationType.MachineToMachine;

  const {
    id,
    Logo,
    metadata: { target, name, description },
  } = data;

  return (
    <div className={classNames(styles.card, hasBorder && styles.hasBorder)}>
      <div className={styles.header}>
        <Suspense fallback={<LogoSkeleton />}>
          <Logo className={styles.logo} />
        </Suspense>
        <div className={styles.infoWrapper}>
          <div className={styles.flexRow}>
            <div className={styles.name}>{name}</div>
            {isSubscriptionRequired && <ProTag />}
          </div>
          <div className={styles.description}>{description}</div>
        </div>
      </div>
      <Button
        title={isSubscriptionRequired ? 'upsell.upgrade_plan' : 'applications.guide.start_building'}
        size="small"
        onClick={() => {
          if (isSubscriptionRequired) {
            navigate(subscriptionPage);
          } else {
            onClick({ target, id });
          }
        }}
      />
    </div>
  );
}

export default GuideCard;
