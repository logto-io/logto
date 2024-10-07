import type { AdminConsoleKey } from '@logto/phrases';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Close from '@/assets/icons/close.svg?react';
import CardTitle from '@/ds-components/CardTitle';
import IconButton from '@/ds-components/IconButton';
import Spacer from '@/ds-components/Spacer';

import styles from './index.module.scss';

type Props = {
  readonly title?: AdminConsoleKey;
  readonly subtitle?: AdminConsoleKey;
  readonly isOpen: boolean;
  readonly children: React.ReactNode;
  readonly onClose?: () => void;
};

function Drawer({ title, subtitle, isOpen, children, onClose }: Props) {
  const { i18n } = useTranslation();
  return (
    <ReactModal
      shouldCloseOnOverlayClick
      // Styling purpose
      // eslint-disable-next-line jsx-a11y/aria-role
      role="drawer"
      data={{ dir: i18n.dir() }}
      isOpen={isOpen}
      className={styles.content}
      overlayClassName={styles.overlay}
      closeTimeoutMS={300}
      onRequestClose={onClose}
    >
      <div className={styles.wrapper}>
        {title && (
          <div className={styles.header}>
            <CardTitle size="small" title={title} subtitle={subtitle} />
            <Spacer />
            <IconButton size="large" onClick={onClose}>
              <Close />
            </IconButton>
          </div>
        )}
        <div className={styles.body}>{children}</div>
      </div>
    </ReactModal>
  );
}

export default Drawer;
