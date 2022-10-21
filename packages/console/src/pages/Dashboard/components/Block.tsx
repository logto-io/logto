import type { AdminConsoleKey } from '@logto/phrases';
import { conditionalString } from '@silverhand/essentials';
import classNames from 'classnames';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import ArrowDown from '@/assets/images/arrow-down.svg';
import ArrowUp from '@/assets/images/arrow-up.svg';
import Tip from '@/assets/images/tip.svg';
import Card from '@/components/Card';
import Tooltip from '@/components/Tooltip';
import { formatNumberWithComma } from '@/utilities/number';

import * as styles from './Block.module.scss';

type Props = {
  count: number;
  delta?: number;
  title: AdminConsoleKey;
  tooltip?: AdminConsoleKey;
  variant?: 'bordered' | 'default' | 'plain';
};

const Block = ({ variant = 'default', count, delta, title, tooltip }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const tipRef = useRef<HTMLDivElement>(null);

  const deltaLable = delta !== undefined && `${conditionalString(delta >= 0 && '+')}${delta}`;

  return (
    <Card className={classNames(styles.block, styles[variant])}>
      <div className={styles.title}>
        {t(title)}
        {tooltip && (
          <div ref={tipRef} className={styles.icon}>
            <Tip />
            <Tooltip anchorRef={tipRef} content={t(tooltip)} />
          </div>
        )}
      </div>
      <div className={styles.content}>
        <div className={styles.number}>{formatNumberWithComma(count)}</div>
        {delta !== undefined && (
          <div className={classNames(styles.delta, delta < 0 && styles.down)}>
            <span>({deltaLable})</span>
            {delta > 0 && <ArrowUp />}
            {delta < 0 && <ArrowDown />}
          </div>
        )}
      </div>
    </Card>
  );
};

export default Block;
