import { type AdminConsoleKey } from '@logto/phrases';
import { conditional, type Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import { Trans, useTranslation } from 'react-i18next';

import Tip from '@/assets/icons/tip.svg?react';
import { addOnPricingExplanationLink } from '@/consts/external-links';
import DynamicT from '@/ds-components/DynamicT';
import IconButton from '@/ds-components/IconButton';
import Tag from '@/ds-components/Tag';
import TextLink from '@/ds-components/TextLink';
import { ToggleTip } from '@/ds-components/Tip';

import { formatNumber } from '../utils';

import styles from './index.module.scss';

export type Props = {
  readonly usage: number | boolean;
  readonly quota?: Nullable<number>;
  readonly usageKey: AdminConsoleKey;
  readonly titleKey: AdminConsoleKey;
  readonly tooltipKey?: AdminConsoleKey;
  readonly unitPrice: number;
  readonly isUsageTipHidden: boolean;
  readonly className?: string;
};

function PlanUsageCard({
  usage,
  quota,
  unitPrice,
  usageKey,
  titleKey,
  tooltipKey,
  isUsageTipHidden,
  className,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

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
                <span className={classNames(styles.usageTip, isUsageTipHidden && styles.hidden)} />
              ),
            }}
          >
            {t(usageKey, {
              usage:
                quota === undefined
                  ? formatNumber(usage)
                  : typeof quota === 'number'
                  ? `${formatNumber(usage)} / ${formatNumber(quota)}${
                      usagePercent === undefined ? '' : ` (${(usagePercent * 100).toFixed(0)}%)`
                    }`
                  : `${formatNumber(usage)} / ${String(t('subscription.quota_table.unlimited'))}`,
            })}
          </Trans>
        </div>
      ) : (
        <div>
          <Tag className={styles.tag} type="state" status={usage ? 'success' : 'info'}>
            <DynamicT
              forKey={`subscription.usage.${usage ? 'status_active' : 'status_inactive'}`}
            />
          </Tag>
        </div>
      )}
    </div>
  );
}

export default PlanUsageCard;
