import type { AdminConsoleKey } from '@logto/phrases';
import { conditionalString } from '@silverhand/essentials';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import ArrowDown from '@/assets/images/arrow-down.svg';
import ArrowUp from '@/assets/images/arrow-up.svg';
import Card from '@/components/Card';
import ToggleTipButton from '@/components/ToggleTipButton';
import { formatNumberWithComma } from '@/utilities/number';

import * as styles from './Block.module.scss';

type Props = {
  count: number;
  delta?: number;
  title: AdminConsoleKey;
  tip?: AdminConsoleKey;
  variant?: 'bordered' | 'default' | 'plain';
};

const Block = ({ variant = 'default', count, delta, title, tip }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const deltaLabel = delta !== undefined && `${conditionalString(delta >= 0 && '+')}${delta}`;

  return (
    <Card className={classNames(styles.block, styles[variant])}>
      <div className={styles.title}>
        {t(title)}
        {tip && (
          <ToggleTipButton className={styles.toggleTipButton} render={() => <div>{t(tip)}</div>} />
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
};

export default Block;
