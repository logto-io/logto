import { type AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import { Trans, useTranslation } from 'react-i18next';

import Tip from '@/assets/icons/tip.svg?react';
import DynamicT from '@/ds-components/DynamicT';
import IconButton from '@/ds-components/IconButton';
import Tag from '@/ds-components/Tag';
import TextLink from '@/ds-components/TextLink';
import { ToggleTip } from '@/ds-components/Tip';

import { formatNumber } from '../utils';

import styles from './index.module.scss';

export type Props = {
  readonly usage: number | boolean;
  readonly quota?: number;
  readonly usageKey: AdminConsoleKey;
  readonly titleKey: AdminConsoleKey;
  readonly tooltipKey: AdminConsoleKey;
  readonly className?: string;
};

function ProPlanUsageCard({ usage, quota, usageKey, titleKey, tooltipKey, className }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={classNames(styles.card, className)}>
      <div className={styles.title}>
        <span>
          <DynamicT forKey={titleKey} />
        </span>
        <ToggleTip
          content={
            <Trans
              components={{
                a: <TextLink to="https://blog.logto.io/pricing-add-ons/" />,
              }}
            >
              {t(tooltipKey)}
            </Trans>
          }
        >
          <IconButton size="small">
            <Tip />
          </IconButton>
        </ToggleTip>
      </div>
      {typeof usage === 'number' ? (
        <div className={styles.description}>
          <Trans
            components={{
              span: <span className={styles.usageTip} />,
            }}
          >
            {t(usageKey, {
              usage:
                quota && typeof quota === 'number'
                  ? `${formatNumber(usage)} / ${formatNumber(quota)}`
                  : formatNumber(usage),
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

export default ProPlanUsageCard;
