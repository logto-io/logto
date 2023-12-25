import { ApplicationType, ReservedPlanId } from '@logto/schemas';
import classNames from 'classnames';
import { useContext } from 'react';

import ApplicationIcon from '@/components/ApplicationIcon';
import FeatureTag from '@/components/FeatureTag';
import { isCloud } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';
import useSubscriptionPlan from '@/hooks/use-subscription-plan';

import * as styles from './index.module.scss';

type Props = {
  title: string;
  subtitle: string;
  description: string;
  type: ApplicationType;
  size?: 'large' | 'small';
};

function TypeDescription({ title, subtitle, description, type, size = 'large' }: Props) {
  const { currentTenantId } = useContext(TenantsContext);
  const { data: currentPlan } = useSubscriptionPlan(currentTenantId);
  const hasPaywall = isCloud && type === ApplicationType.MachineToMachine;

  return (
    <div className={classNames(styles.container, styles[size])}>
      <ApplicationIcon type={type} />
      <div className={styles.title}>{title}</div>
      <div className={styles.subtitle}>{subtitle}</div>
      <div className={styles.description}>{description}</div>
      {hasPaywall && (
        <div className={styles.proTag}>
          <FeatureTag
            isVisible={!currentPlan?.quota.machineToMachineLimit}
            for="upsell"
            plan={ReservedPlanId.Pro}
          />
        </div>
      )}
    </div>
  );
}

export default TypeDescription;
