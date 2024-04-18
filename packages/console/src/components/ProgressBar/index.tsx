import classNames from 'classnames';

import * as styles from './index.module.scss';

type Props = {
  readonly currentStep: number;
  readonly totalSteps: number;
};

function ProgressBar({ currentStep, totalSteps }: Props) {
  return (
    <div className={styles.progressBar}>
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div
          key={step}
          className={classNames(styles.stepIndicator, step <= currentStep && styles.active)}
        />
      ))}
    </div>
  );
}

export default ProgressBar;
