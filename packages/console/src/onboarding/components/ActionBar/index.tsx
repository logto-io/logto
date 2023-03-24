import type { ReactNode } from 'react';

import ProgressBar from '../ProgressBar';

import * as styles from './index.module.scss';

type Props = {
  step: number;
  children: ReactNode;
};

const totalSteps = 3;

function ActionBar({ step, children }: Props) {
  return (
    <div className={styles.container}>
      <ProgressBar currentStep={step} totalSteps={totalSteps} />
      <div className={styles.actions}>{children}</div>
    </div>
  );
}

export default ActionBar;
