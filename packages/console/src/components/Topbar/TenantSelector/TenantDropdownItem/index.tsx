import { TenantTag } from '@logto/schemas';
import classNames from 'classnames';
import { useContext, useMemo } from 'react';

import Tick from '@/assets/icons/tick.svg?react';
import { type TenantResponse } from '@/cloud/types/router';
import PlanName from '@/components/PlanName';
import TenantEnvTag from '@/components/TenantEnvTag';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { DropdownItem } from '@/ds-components/Dropdown';
import DynamicT from '@/ds-components/DynamicT';

import TenantStatusTag from './TenantStatusTag';
import styles from './index.module.scss';

type Props = {
  readonly tenantData: TenantResponse;
  readonly isSelected: boolean;
  readonly onClick: () => void;
};

function TenantDropdownItem({ tenantData, isSelected, onClick }: Props) {
  const {
    name,
    tag,
    subscription: { planId },
  } = tenantData;

  const { currentPlan, subscriptionPlans } = useContext(SubscriptionDataContext);
  const tenantSubscriptionPlan = useMemo(
    () => subscriptionPlans.find((plan) => plan.id === planId),
    [subscriptionPlans, planId]
  );

  if (!tenantSubscriptionPlan) {
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
            tenantSubscriptionPlan={tenantSubscriptionPlan}
            className={styles.statusTag}
          />
        </div>
        <div className={styles.planName}>
          {tag === TenantTag.Development ? (
            <DynamicT forKey="subscription.no_subscription" />
          ) : (
            <PlanName skuId={planId} name={currentPlan.name} />
          )}
        </div>
      </div>
      <Tick className={classNames(styles.checkIcon, isSelected && styles.visible)} />
    </DropdownItem>
  );
}

export default TenantDropdownItem;
