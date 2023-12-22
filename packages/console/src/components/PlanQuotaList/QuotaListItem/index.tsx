import classNames from 'classnames';
import { type ReactNode } from 'react';

import { type SubscriptionPlanQuota } from '@/types/subscriptions';

import QuotaItemPhrase from './QuotaItemPhrase';
import * as styles from './index.module.scss';

type Props = {
  quotaKey: keyof SubscriptionPlanQuota;
  quotaValue: SubscriptionPlanQuota[keyof SubscriptionPlanQuota];
  icon?: ReactNode;
  suffix?: ReactNode;
  isAddOn?: boolean;
  phraseClassName?: string;
};

function QuotaListItem({ icon, suffix, phraseClassName, ...rest }: Props) {
  return (
    <li className={classNames(styles.quotaListItem, icon && styles.withIcon)}>
      {/**
       * Add a `span` as a wrapper to apply the flex layout to the content.
       * If we apply the flex layout to the `li` directly, the `li` circle bullet will disappear.
       */}
      <span className={styles.content}>
        {icon}
        <span className={phraseClassName}>
          <QuotaItemPhrase {...rest} />
        </span>
        {suffix}
      </span>
    </li>
  );
}

export default QuotaListItem;
