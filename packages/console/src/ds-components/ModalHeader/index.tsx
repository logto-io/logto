import { type AdminConsoleKey } from '@logto/phrases';
import { type ReactNode } from 'react';

import Close from '@/assets/icons/close.svg';

import CardTitle from '../CardTitle';
import IconButton from '../IconButton';
import Spacer from '../Spacer';

import * as styles from './index.module.scss';

type Props = {
  readonly title: AdminConsoleKey;
  readonly subtitle: AdminConsoleKey;
  readonly actionButton?: ReactNode;
  readonly onClose: () => void;
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
