import { type AdminConsoleKey } from '@logto/phrases';
import { conditional, type Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import Tip from '@/assets/icons/tip.svg?react';
import { type LogtoSkuResponse } from '@/cloud/types/router';
import { addOnPricingExplanationLink } from '@/consts/external-links';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import DynamicT from '@/ds-components/DynamicT';
import IconButton from '@/ds-components/IconButton';
import Tag from '@/ds-components/Tag';
import TextLink from '@/ds-components/TextLink';
import { ToggleTip } from '@/ds-components/Tip';
import { isPaidPlan } from '@/utils/subscription';

import { formatNumber } from '../utils';

import styles from './index.module.scss';

const formatQuotaNumber = (number: number): string => {
  if (number >= 1e6) {
    return (number / 1e6).toFixed(1) + 'M';
  }

  if (number >= 1e3) {
    return (number / 1e3).toFixed(1) + 'K';
  }

  if (Number.isInteger(number)) {
    return number.toString();
  }

  return number.toFixed(2);
};

const formatNumberTypedUsageDescription = ({
  usage,
  quota,
  unlimitedString,
}: {
  usage: number;
  quota?: Props['quota'];
  unlimitedString: string;
}) => {
  // Only show usage if quota is undefined or boolean (although quota should not be boolean if quota is number-typed).
  if (quota === undefined || typeof quota === 'boolean') {
    return formatNumber(usage);
  }

  // Show `usage / quota (usage percent)` if quota is number-typed, but hide the percentage display if usage percent is 0.
  if (typeof quota === 'number') {
    const usagePercent = usage / quota;
    return `${formatNumber(usage)} / ${formatQuotaNumber(quota)}${
      usagePercent > 0 ? ` (${(usagePercent * 100).toFixed(0)}%)` : ''
    }`;
  }

  // Show `usage / unlimited` if quota is null.
  return `${formatNumber(usage)} / ${unlimitedString}`;
};

/**
 * The price unit returned from DB is cent, so we need to divide it by 100 to get the dollar price.
 */
const formatDecimalPrice = (price: number): string => {
  return (price / 100).toFixed(2);
};

// Manually format the quota display for add-on usages
const formatAddOnQuota = (quota?: LogtoSkuResponse['quota']) => {
  if (!quota) {
    return;
  }

  return {
    ...quota,
    ...conditional(quota.tokenLimit && { tokenLimit: formatQuotaNumber(quota.tokenLimit) }),
  };
};

/**
 * @param unitPrice Hardcoded add-on unit price. Only used for the tooltip.
 * @param usageAddOnSku The add-on SKU object. Only used for the tooltip.
 *  If provided, use the unit price and count from the SKU object first. Otherwise, fallback to the hardcoded unit price.
 */
export type Props = {
  readonly usage: number | boolean;
  readonly quota?: Nullable<number> | boolean;
  readonly basicQuota?: Nullable<number> | boolean;
  readonly usageKey: AdminConsoleKey;
  readonly titleKey: AdminConsoleKey;
  readonly tooltipKey?: AdminConsoleKey;
  readonly unitPrice: number;
  readonly className?: string;
  readonly isQuotaNoticeHidden?: boolean;
  readonly usageAddOnSku?: LogtoSkuResponse;
};

function PlanUsageCard({
  usage,
  quota,
  basicQuota,
  unitPrice,
  usageKey,
  titleKey,
  tooltipKey,
  className,
  isQuotaNoticeHidden,
  usageAddOnSku,
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
                  price: usageAddOnSku?.unitPrice
                    ? formatDecimalPrice(usageAddOnSku.unitPrice)
                    : unitPrice,
                  ...conditional(
                    typeof basicQuota === 'number' && {
                      basicQuota: formatQuotaNumber(basicQuota),
                      // For i18n singular/plural support use only.
                      // - tenant_members
                      count: basicQuota,
                    }
                  ),
                  ...conditional(usageAddOnSku && formatAddOnQuota(usageAddOnSku.quota)),
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
            typeof usagePercent === 'number' &&
              usagePercent >= 1 &&
              !isPaidTenant &&
              styles.quotaExceeded
          )}
        >
          <Trans
            components={{
              span: (
                <span
                  className={classNames(
                    styles.usageTip,
                    // Hide usage tip for free plan users.
                    (!isPaidTenant || basicQuota === undefined || isQuotaNoticeHidden) &&
                      styles.hidden
                  )}
                />
              ),
            }}
          >
            {/* Can not use `DynamicT` here since we need to inherit the style of span. */}
            {t(
              (() => {
                if (basicQuota === null || basicQuota === true) {
                  return 'subscription.usage.usage_description_with_unlimited_quota';
                }

                if (basicQuota === false || basicQuota === 0) {
                  return 'subscription.usage.usage_description_without_quota';
                }

                if (typeof basicQuota === 'number') {
                  return 'subscription.usage.usage_description_with_limited_quota';
                }

                return usageKey;
              })(),
              isPaidTenant
                ? {
                    usage: formatNumber(usage),
                    ...conditional(
                      typeof basicQuota === 'number' && {
                        basicQuota: formatQuotaNumber(basicQuota),
                      }
                    ),
                  }
                : {
                    usage: formatNumberTypedUsageDescription({
                      usage,
                      quota,
                      unlimitedString: String(t('subscription.quota_table.unlimited')),
                    }),
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
          {/* Only show the quota notice for enterprise plan. */}
          {quota !== undefined && isEnterprisePlan && (
            <div className={styles.usageTip}>
              {/* Consider the type of quota is number, null or boolean, the following statement covers all cases. */}
              {(() => {
                if (quota === null || quota === true) {
                  return (
                    <DynamicT forKey="subscription.usage.unlimited_status_quota_description" />
                  );
                }

                if (quota === false || quota === 0) {
                  return <DynamicT forKey="subscription.usage.disabled_status_quota_description" />;
                }

                if (typeof quota === 'number') {
                  return (
                    <DynamicT
                      forKey="subscription.usage.limited_status_quota_description"
                      interpolation={{
                        quota: formatQuotaNumber(quota),
                      }}
                    />
                  );
                }

                return null;
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PlanUsageCard;
