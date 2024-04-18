import type { ReactNode } from 'react';

import ProgressBar from '../ProgressBar';

import * as styles from './index.module.scss';

type Props = {
  readonly step: number;
  readonly totalSteps: number;
  readonly children: ReactNode;
};

function ActionBar({ step, totalSteps, children }: Props) {
  return (
    <div className={styles.container}>
      <ProgressBar currentStep={step} totalSteps={totalSteps} />
      <div className={styles.actions}>{children}</div>
    </div>
  );
}

export default ActionBar;
