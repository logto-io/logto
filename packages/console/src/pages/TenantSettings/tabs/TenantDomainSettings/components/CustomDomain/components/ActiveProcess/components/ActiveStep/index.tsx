import { type AdminConsoleKey } from '@logto/phrases';
import { type ReactNode } from 'react';

import Tip from '@/assets/images/tip.svg';
import DynamicT from '@/components/DynamicT';
import IconButton from '@/components/IconButton';
import ToggleTip from '@/components/Tip/ToggleTip';

import ActiveStepStatus, { type StepStatus } from '../ActiveStepStatus';

import * as styles from './index.module.scss';

type Props = {
  step: number;
  title: AdminConsoleKey;
  tip?: AdminConsoleKey;
  status: StepStatus;
  children?: ReactNode;
};

function ActiveStep({ step, title, tip, status, children }: Props) {
  return (
    <div className={styles.step}>
      <div className={styles.header}>
        <ActiveStepStatus step={step} status={status} />
        <div className={styles.title}>
          <DynamicT forKey={title} />
        </div>
        {tip && (
          <ToggleTip
            anchorClassName={styles.tip}
            content={<DynamicT forKey={tip} />}
            horizontalAlign="start"
          >
            <IconButton size="small">
              <Tip />
            </IconButton>
          </ToggleTip>
        )}
      </div>
      <div className={styles.contentContainer}>{children}</div>
    </div>
  );
}

export default ActiveStep;
