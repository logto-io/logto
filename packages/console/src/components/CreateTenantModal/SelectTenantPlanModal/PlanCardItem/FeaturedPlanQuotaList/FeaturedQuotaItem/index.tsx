import { cond } from '@silverhand/essentials';
import classNames from 'classnames';

import Failed from '@/assets/icons/failed.svg';
import Success from '@/assets/icons/success.svg';
import QuotaListItem from '@/components/PlanQuotaList/QuotaListItem';
import DynamicT from '@/ds-components/DynamicT';
import Tag from '@/ds-components/Tag';
import { type SubscriptionPlanQuota } from '@/types/subscriptions';

import * as styles from './index.module.scss';

type Props = {
  quotaKey: keyof SubscriptionPlanQuota;
  quotaValue: SubscriptionPlanQuota[keyof SubscriptionPlanQuota];
  isAddOnQuota: boolean;
  isComingSoonTagVisible: boolean;
};

function FeaturedQuotaItem({ quotaKey, quotaValue, isAddOnQuota, isComingSoonTagVisible }: Props) {
  const isNotCapable = quotaValue === 0 || quotaValue === false;
  const Icon = isNotCapable ? Failed : Success;

  return (
    <QuotaListItem
      quotaKey={quotaKey}
      quotaValue={quotaValue}
      isAddOn={isAddOnQuota}
      icon={
        <Icon
          className={classNames(styles.icon, isNotCapable ? styles.notCapable : styles.capable)}
        />
      }
      suffix={cond(
        isComingSoonTagVisible && (
          <Tag>
            <DynamicT forKey="general.coming_soon" />
          </Tag>
        )
      )}
    />
  );
}

export default FeaturedQuotaItem;
