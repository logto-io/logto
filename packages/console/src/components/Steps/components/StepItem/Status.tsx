import classNames from 'classnames';

import Failed from '@/assets/images/failed.svg';
import Success from '@/assets/images/success.svg';
import { Ring } from '@/components/Spinner';

import * as styles from './Status.module.scss';

export type StepStatus = 'finished' | 'failed' | 'pending' | 'loading';

type Props = {
  step: number;
  status?: StepStatus;
  className?: string;
};

function Status({ step, status = 'pending', className }: Props) {
  const statusStyle = classNames(styles.status, styles[status], className);

  if (status === 'loading') {
    return <Ring className={statusStyle} />;
  }

  if (status === 'pending') {
    return <div className={statusStyle}>{step}</div>;
  }

  // For finished and failed status
  const StatusIcon = status === 'finished' ? Success : Failed;
  return (
    <div className={statusStyle}>
      <StatusIcon className={styles.icon} />
    </div>
  );
}

export default Status;
