import type { ReactNode } from 'react';

import ProgressBar from '../ProgressBar';

import styles from './index.module.scss';

type Props =
  | {
      readonly step: number;
      readonly totalSteps: number;
      readonly children: ReactNode;
    }
  | {
      readonly children: ReactNode;
    };

function ActionBar(props: Props) {
  return (
    <div className={styles.container}>
      {'step' in props && 'totalSteps' in props && (
        <ProgressBar currentStep={props.step} totalSteps={props.totalSteps} />
      )}
      <div className={styles.actions}>{props.children}</div>
    </div>
  );
}

export default ActionBar;
