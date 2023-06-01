import { type AdminConsoleKey } from '@logto/phrases';
import { type ReactNode } from 'react';

import DynamicT from '@/components/DynamicT';

import Status, { type StepStatus } from './Status';
import * as styles from './index.module.scss';

export type StepItemProps = {
  step: number;
  currentStep: number;
  status: StepStatus;
  title: AdminConsoleKey;
  content?: ReactNode;
  isContentVisibleOnFinished?: boolean;
  isDashLineVisible?: boolean;
};

function StepItem({
  step,
  currentStep,
  status,
  title,
  content,
  isContentVisibleOnFinished = false,
  isDashLineVisible = true,
}: StepItemProps) {
  const displayContent = status === 'finished' ? isContentVisibleOnFinished : step === currentStep;

  return (
    <div className={styles.step}>
      <div className={styles.header}>
        <Status step={step} status={status} className={styles.status} />
        <div className={styles.title}>
          <DynamicT forKey={title} />
        </div>
      </div>
      <div className={styles.contentContainer}>
        {isDashLineVisible && <div className={styles.dashLine} />}
        {displayContent && content}
      </div>
    </div>
  );
}

export default StepItem;
