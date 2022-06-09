import { AdminConsoleKey } from '@logto/phrases';
import { conditionalString } from '@silverhand/essentials';
import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Card from '@/components/Card';
import { ArrowDown, ArrowUp } from '@/icons/Arrow';
import { formatNumberWithComma } from '@/utilities/number';

import * as styles from './Block.module.scss';

type Props = {
  count: number;
  delta?: number;
  title: AdminConsoleKey;
  varient?: 'bordered' | 'default' | 'plain';
};

const Block = ({ varient = 'default', count, delta, title }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const deltaLable = delta !== undefined && `${conditionalString(delta >= 0 && '+')}${delta}`;

  return (
    <Card className={classNames(styles.block, styles[varient])}>
      <div className={styles.title}>{t(title)}</div>
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
