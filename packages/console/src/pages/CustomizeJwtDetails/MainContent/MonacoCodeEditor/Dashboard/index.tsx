import classNames from 'classnames';
import { type ReactNode } from 'react';

import CloseIcon from '@/assets/icons/close.svg?react';
import IconButton from '@/ds-components/IconButton';

import styles from './index.module.scss';

export type Props = {
  readonly title: string;
  readonly content: ReactNode;
  readonly className?: string;
  readonly onClose: () => void;
};

function Dashboard({ title, content, className, onClose }: Props) {
  return (
    <div className={classNames(styles.dashboard, className)}>
      <div className={styles.dashboardHeader}>
        <span>{title}</span>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </div>
      <div className={styles.dashboardContent}>{content}</div>
    </div>
  );
}

export default Dashboard;
