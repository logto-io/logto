import type { AdminConsoleKey } from '@logto/phrases';
import { conditionalString } from '@silverhand/essentials';
import classNames from 'classnames';

import ArrowDown from '@/assets/icons/arrow-down.svg?react';
import ArrowUp from '@/assets/icons/arrow-up.svg?react';
import Tip from '@/assets/icons/tip.svg?react';
import Card from '@/ds-components/Card';
import DynamicT from '@/ds-components/DynamicT';
import IconButton from '@/ds-components/IconButton';
import { ToggleTip } from '@/ds-components/Tip';
import type { Props as ToggleTipProps } from '@/ds-components/Tip/ToggleTip';
import { formatNumberWithComma } from '@/utils/number';

import styles from './Block.module.scss';

type Props = {
  readonly count: number;
  readonly delta?: number;
  readonly title: AdminConsoleKey;
  readonly tip?: ToggleTipProps['content'];
  readonly variant?: 'bordered' | 'default' | 'plain';
};

function Block({ variant = 'default', count, delta, title, tip }: Props) {
  const deltaLabel = delta !== undefined && `${conditionalString(delta >= 0 && '+')}${delta}`;

  return (
    <Card className={classNames(styles.block, styles[variant])}>
      <div className={styles.title}>
        <DynamicT forKey={title} />
        {tip && (
          <ToggleTip anchorClassName={styles.toggleTipButton} content={tip}>
            <IconButton size="small">
              <Tip />
            </IconButton>
          </ToggleTip>
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.number}>{formatNumberWithComma(count)}</div>
        {delta !== undefined && (
          <div className={classNames(styles.delta, delta < 0 && styles.down)}>
            <span>({deltaLabel})</span>
            {delta > 0 && <ArrowUp />}
            {delta < 0 && <ArrowDown />}
          </div>
        )}
      </div>
    </Card>
  );
}

export default Block;
