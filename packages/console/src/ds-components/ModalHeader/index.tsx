import { type AdminConsoleKey } from '@logto/phrases';
import { type ReactNode } from 'react';

import Close from '@/assets/icons/close.svg';

import CardTitle from '../CardTitle';
import IconButton from '../IconButton';
import Spacer from '../Spacer';

import * as styles from './index.module.scss';

type Props = {
  title: AdminConsoleKey;
  subtitle: AdminConsoleKey;
  actionButton?: ReactNode;
  onClose: () => void;
};

function ModalHeader({ title, subtitle, actionButton, onClose }: Props) {
  return (
    <div className={styles.header}>
      <IconButton size="large" onClick={onClose}>
        <Close className={styles.closeIcon} />
      </IconButton>
      <div className={styles.separator} />
      <CardTitle size="small" title={title} subtitle={subtitle} />
      <Spacer />
      {actionButton}
    </div>
  );
}

export default ModalHeader;
