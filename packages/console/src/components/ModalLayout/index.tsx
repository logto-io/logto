import { AdminConsoleKey } from '@logto/phrases';
import React, { ReactNode } from 'react';

import Close from '@/icons/Close';

import Card from '../Card';
import CardTitle from '../CardTitle';
import IconButton from '../IconButton';
import * as styles from './index.module.scss';

type Props = {
  title: AdminConsoleKey;
  subtitle?: AdminConsoleKey;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
};

const ModalLayout = ({ title, subtitle, children, footer, onClose }: Props) => {
  return (
    <Card className={styles.container}>
      <div className={styles.header}>
        <CardTitle title={title} subtitle={subtitle} />
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </div>
      <div>{children}</div>
      {footer && <div className={styles.footer}>{footer}</div>}
    </Card>
  );
};

export default ModalLayout;
