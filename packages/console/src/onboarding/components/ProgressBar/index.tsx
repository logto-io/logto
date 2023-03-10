import classNames from 'classnames';

import * as styles from './index.module.scss';

type Props = {
  currentStep: number;
  totalSteps: number;
};

const ProgressBar = ({ currentStep, totalSteps }: Props) => (
  <div className={styles.progressBar}>
    {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
      <div
        key={step}
        className={classNames(styles.stepIndicator, step <= currentStep && styles.active)}
      />
    ))}
  </div>
);

export default ProgressBar;
