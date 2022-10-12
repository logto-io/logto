import { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import { ReactNode } from 'react';

import Close from '@/assets/images/close.svg';

import Card from '../Card';
import CardTitle from '../CardTitle';
import IconButton from '../IconButton';
import * as styles from './index.module.scss';

type Props = {
  title: AdminConsoleKey;
  subtitle?: AdminConsoleKey;
  children: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
  className?: string;
  size?: 'medium' | 'large' | 'xlarge';
};

const ModalLayout = ({
  title,
  subtitle,
  children,
  footer,
  onClose,
  className,
  size = 'medium',
}: Props) => {
  return (
    <Card className={classNames(styles.container, styles[size])}>
      <div className={styles.header}>
        <CardTitle title={title} subtitle={subtitle} />
        {onClose && (
          <IconButton
            onClick={() => {
              onClose();
            }}
          >
            <Close className={styles.closeIcon} />
          </IconButton>
        )}
      </div>
      <div className={className}>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </Card>
  );
};

export default ModalLayout;
