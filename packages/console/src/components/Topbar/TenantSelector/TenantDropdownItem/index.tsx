import { TenantTag } from '@logto/schemas';
import classNames from 'classnames';
import { useMemo } from 'react';

import Tick from '@/assets/icons/tick.svg';
import { type TenantResponse } from '@/cloud/types/router';
import PlanName from '@/components/PlanName';
import TenantEnvTag from '@/components/TenantEnvTag';
import { isDevFeaturesEnabled } from '@/consts/env';
import { DropdownItem } from '@/ds-components/Dropdown';
import DynamicT from '@/ds-components/DynamicT';
import useSubscriptionPlans from '@/hooks/use-subscription-plans';

import TenantStatusTag from './TenantStatusTag';
import * as styles from './index.module.scss';

type Props = {
  tenantData: TenantResponse;
  isSelected: boolean;
  onClick: () => void;
};

function TenantDropdownItem({ tenantData, isSelected, onClick }: Props) {
  const {
    name,
    tag,
    subscription: { planId },
  } = tenantData;

  const { data: plans } = useSubscriptionPlans();
  const tenantPlan = useMemo(() => plans?.find((plan) => plan.id === planId), [plans, planId]);

  if (!tenantPlan) {
    return null;
  }

  return (
    <DropdownItem className={styles.item} onClick={onClick}>
      <div className={styles.info}>
        <div className={styles.meta}>
          <div className={styles.name}>{name}</div>
          <TenantEnvTag tag={tag} />
          <TenantStatusTag
            tenantData={tenantData}
            tenantPlan={tenantPlan}
            className={styles.statusTag}
          />
        </div>
        <div className={styles.planName}>
          {/* Todo: @xiaoyijun remove dev tenant feature switch */}
          {isDevFeaturesEnabled && tag === TenantTag.Development ? (
            <DynamicT forKey="subscription.no_subscription" />
          ) : (
            <PlanName name={tenantPlan.name} />
          )}
        </div>
      </div>
      <Tick className={classNames(styles.checkIcon, isSelected && styles.visible)} />
    </DropdownItem>
  );
}

export default TenantDropdownItem;
