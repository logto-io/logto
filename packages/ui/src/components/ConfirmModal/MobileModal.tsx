import classNames from 'classnames';
import ReactModal from 'react-modal';

import Button from '@/components/Button';

import * as modalStyles from '../../scss/modal.module.scss';
import * as styles from './MobileModal.module.scss';
import { ModalProps } from './type';

const MobileModal = ({
  className,
  isOpen = false,
  type = 'confirm',
  children,
  cancelText = 'action.cancel',
  confirmText = 'action.confirm',
  onConfirm,
  onClose,
}: ModalProps) => {
  return (
    <ReactModal
      role="dialog"
      isOpen={isOpen}
      className={classNames(styles.modal, className)}
      overlayClassName={classNames(modalStyles.overlay, styles.overlay)}
    >
      <div className={styles.container}>
        <div className={styles.content}>{children}</div>
        <div className={styles.footer}>
          <Button
            title={cancelText}
            type="secondary"
            onClick={() => {
              onClose();
            }}
          />
          {type === 'confirm' && (
            <Button
              title={confirmText}
              onClick={() => {
                (onConfirm ?? onClose)();
              }}
            />
          )}
        </div>
      </div>
    </ReactModal>
  );
};

export default MobileModal;
