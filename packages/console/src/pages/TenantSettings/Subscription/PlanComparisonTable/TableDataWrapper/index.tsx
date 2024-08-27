import classNames from 'classnames';

import Tip from '@/assets/icons/tip.svg?react';
import IconButton from '@/ds-components/IconButton';
import { ToggleTip } from '@/ds-components/Tip';

import TableDataContent from './TableDataContent';
import styles from './index.module.scss';

type Props = {
  readonly value: string;
  readonly isLeftAligned?: boolean;
};

function TableDataWrapper({ value, isLeftAligned = false }: Props) {
  const [content = '', tip, extraInfo] = value.split('|');

  return (
    <div>
      <div className={classNames(styles.quotaValue, isLeftAligned && styles.leftAligned)}>
        <TableDataContent content={content} />
        {tip && (
          <ToggleTip content={tip}>
            <IconButton size="small">
              <Tip />
            </IconButton>
          </ToggleTip>
        )}
      </div>
      {extraInfo && <div className={styles.extraInfo}>{extraInfo}</div>}
    </div>
  );
}

export default TableDataWrapper;
