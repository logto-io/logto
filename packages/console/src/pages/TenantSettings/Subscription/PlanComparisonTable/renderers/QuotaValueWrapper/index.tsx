import { type ReactNode } from 'react';

import Tip from '@/assets/icons/tip.svg';
import IconButton from '@/ds-components/IconButton';
import { ToggleTip } from '@/ds-components/Tip';

import * as styles from './index.module.scss';

type Props = {
  children: ReactNode;
  tip?: ReactNode;
};

function QuotaValueWrapper({ children, tip }: Props) {
  return (
    <div className={styles.quotaValue}>
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

export default QuotaValueWrapper;
