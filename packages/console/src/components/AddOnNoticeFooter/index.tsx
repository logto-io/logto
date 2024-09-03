import { type AdminConsoleKey } from '@logto/phrases';
import { type ReactNode } from 'react';

import Button from '@/ds-components/Button';

import styles from './index.module.scss';

type Props = {
  readonly children: ReactNode;
  readonly isLoading?: boolean;
  readonly buttonTitle?: AdminConsoleKey;
  readonly onClick: () => void;
};

function AddOnNoticeFooter({ children, isLoading, onClick, buttonTitle }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.description}>{children}</div>
      <Button
        size="large"
        type="primary"
        title={buttonTitle ?? 'upsell.upgrade_plan'}
        isLoading={isLoading}
        onClick={onClick}
      />
    </div>
  );
}

export default AddOnNoticeFooter;
