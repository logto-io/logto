import classNames from 'classnames';

import CardIcon from '@/assets/icons/card.svg?react';
import { useSubscriptionEntry } from '@/cloud/hooks/use-user-subscriptions';
import { isDevFeaturesEnabled } from '@/consts/env';
import { GlobalRoute } from '@/contexts/TenantsProvider';
import DynamicT from '@/ds-components/DynamicT';
import TextLink from '@/ds-components/TextLink';

import styles from '../index.module.scss';

type Props = {
  readonly className?: string;
};

function EnterpriseSubscriptions({ className }: Props) {
  const { enterprises, hasSubscriptions } = useSubscriptionEntry();
  const enterprise = enterprises.data?.[0];
  if (!enterprise && !hasSubscriptions) {
    return null;
  }

  return (
    <TextLink
      targetBlank
      className={classNames(styles.button, className)}
      icon={<CardIcon className={styles.icon} />}
      href={
        enterprise && !isDevFeaturesEnabled
          ? `${GlobalRoute.EnterpriseSubscription}/${enterprise.id}`
          : GlobalRoute.EnterpriseSubscription
      }
    >
      <DynamicT forKey="topbar.subscription" />
    </TextLink>
  );
}

export default EnterpriseSubscriptions;
