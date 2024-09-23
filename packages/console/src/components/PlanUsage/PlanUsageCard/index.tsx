import { type AdminConsoleKey } from '@logto/phrases';
import { conditional, type Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import Tip from '@/assets/icons/tip.svg?react';
import { addOnPricingExplanationLink } from '@/consts/external-links';
import { tokenCountUnit } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import DynamicT from '@/ds-components/DynamicT';
import IconButton from '@/ds-components/IconButton';
import Tag from '@/ds-components/Tag';
import TextLink from '@/ds-components/TextLink';
import { ToggleTip } from '@/ds-components/Tip';
import { isPaidPlan } from '@/utils/subscription';

import { formatNumber } from '../utils';

import styles from './index.module.scss';

const formatQuotaNumber = (rawNumber: number): string => {
  const number = rawNumber >= 0.1 * tokenCountUnit ? rawNumber / tokenCountUnit : rawNumber;

  if (Number.isInteger(number)) {
    return number.toString();
  }
  return number.toFixed(2);
};

export type Props = {
  readonly usage: number | boolean;
  readonly quota?: Nullable<number> | boolean;
  readonly basicQuota?: Nullable<number> | boolean;
  readonly usageKey: AdminConsoleKey;
  readonly titleKey: AdminConsoleKey;
  readonly tooltipKey?: AdminConsoleKey;
  readonly unitPrice: number;
  readonly className?: string;
};

// TODO: refactor this component to reduce complexity
// eslint-disable-next-line complexity
function PlanUsageCard({
  usage,
  quota,
  basicQuota,
  unitPrice,
  usageKey,
  titleKey,
  tooltipKey,
  className,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    currentSubscription: { planId, isEnterprisePlan },
  } = useContext(SubscriptionDataContext);

  const isPaidTenant = isPaidPlan(planId, isEnterprisePlan);

  const usagePercent = conditional(
    typeof quota === 'number' && typeof usage === 'number' && usage / quota
  );

  return (
    <div className={classNames(styles.card, className)}>
      <div className={styles.title}>
        <span>
          <DynamicT forKey={titleKey} />
        </span>
        {tooltipKey && (
          <ToggleTip
            content={
              <Trans
                components={{
                  a: <TextLink to={addOnPricingExplanationLink} />,
                }}
              >
                {t(tooltipKey, {
                  price: unitPrice,
                  ...conditional(
                    (quota === null || typeof quota === 'number') && { quota: basicQuota }
                  ),
                })}
              </Trans>
            }
          >
            <IconButton size="small">
              <Tip />
            </IconButton>
          </ToggleTip>
        )}
      </div>
      {typeof usage === 'number' ? (
        <div
          className={classNames(
            styles.description,
            typeof usagePercent === 'number' && usagePercent >= 1 && styles.quotaExceeded
          )}
        >
          <Trans
            components={{
              span: (
                <span
                  className={classNames(
                    styles.usageTip,
                    (!isPaidTenant || basicQuota === undefined || basicQuota === 0) && styles.hidden
                  )}
                />
              ),
            }}
          >
            {t(
              basicQuota === null ? 'subscription.usage.unlimited_quota_description' : usageKey,
              isPaidTenant
                ? {
                    usage: formatNumber(usage),
                    ...conditional(
                      typeof basicQuota === 'number' && {
                        quota: formatQuotaNumber(basicQuota),
                      }
                    ),
                  }
                : {
                    usage:
                      quota === undefined
                        ? formatNumber(usage)
                        : typeof quota === 'number'
                        ? `${formatNumber(usage)} / ${formatNumber(quota)}${
                            usagePercent === undefined
                              ? ''
                              : ` (${(usagePercent * 100).toFixed(0)}%)`
                          }`
                        : `${formatNumber(usage)} / ${String(
                            t('subscription.quota_table.unlimited')
                          )}`,
                  }
            )}
          </Trans>
        </div>
      ) : (
        <div className={styles.tagContainer}>
          <Tag className={styles.tag} type="state" status={usage ? 'success' : 'info'}>
            <DynamicT
              forKey={`subscription.usage.${usage ? 'status_active' : 'status_inactive'}`}
            />
          </Tag>
          {quota !== undefined && (
            <div className={styles.usageTip}>
              {(quota === null || quota === true) && (
                <DynamicT forKey="subscription.usage.unlimited_status_quota_description" />
              )}
              {typeof quota === 'number' && (
                <>
                  {t('subscription.usage.status_quota_description', {
                    quota: formatQuotaNumber(quota),
                  })}
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PlanUsageCard;
