import { AdminConsoleKey } from '@logto/phrases';
import ReactModal from 'react-modal';

import Close from '@/assets/images/close.svg';

import CardTitle from '../CardTitle';
import IconButton from '../IconButton';
import Spacer from '../Spacer';
import * as styles from './index.module.scss';

type Props = {
  title?: AdminConsoleKey;
  subtitle?: AdminConsoleKey;
  isOpen: boolean;
  children: React.ReactNode;
  onClose?: () => void;
};

const Drawer = ({ title, subtitle, isOpen, children, onClose }: Props) => {
  return (
    <ReactModal
      shouldCloseOnOverlayClick
      // Styling purpose
      // eslint-disable-next-line jsx-a11y/aria-role
      role="drawer"
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
};

export default Drawer;
