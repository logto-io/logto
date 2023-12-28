import classNames from 'classnames';
import { type ReactNode } from 'react';

import Tip from '@/assets/icons/tip.svg';
import IconButton from '@/ds-components/IconButton';
import { ToggleTip } from '@/ds-components/Tip';

import * as styles from './index.module.scss';

type Props = {
  children: ReactNode;
  tip?: ReactNode;
  isLeftAligned?: boolean;
};

function TableDataWrapper({ children, tip, isLeftAligned }: Props) {
  return (
    <div className={classNames(styles.quotaValue, isLeftAligned && styles.leftAligned)}>
      {children}
      {tip && (
        <ToggleTip content={tip}>
          <IconButton size="small">
            <Tip />
          </IconButton>
        </ToggleTip>
      )}
    </div>
  );
}

export default TableDataWrapper;
