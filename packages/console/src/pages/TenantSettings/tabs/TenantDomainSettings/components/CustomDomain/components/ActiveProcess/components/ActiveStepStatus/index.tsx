import camelcase from 'camelcase';
import classNames from 'classnames';

import Failed from '@/assets/images/failed.svg';
import Success from '@/assets/images/success.svg';
import { Ring } from '@/components/Spinner';

import * as styles from './index.module.scss';

export enum StepStatus {
  Finished = 'Finished',
  Failed = 'Failed',
  Pending = 'Pending',
  Loading = 'Loading',
}

type Props = {
  step: number;
  status?: StepStatus;
};

function ActiveStepStatus({ step, status = StepStatus.Pending }: Props) {
  const statusStyle = classNames(styles.status, styles[camelcase(status)]);

  if (status === StepStatus.Loading) {
    return <Ring className={statusStyle} />;
  }

  if (status === StepStatus.Pending) {
    return <div className={statusStyle}>{step}</div>;
  }

  // For finished and failed status
  const StatusIcon = status === StepStatus.Finished ? Success : Failed;
  return (
    <div className={statusStyle}>
      <StatusIcon className={styles.icon} />
    </div>
  );
}

export default ActiveStepStatus;
