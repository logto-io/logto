import classNames from 'classnames';
import ReactModal from 'react-modal';

import Button from '@/components/Button';

import * as modalStyles from '../../scss/modal.module.scss';

import * as styles from './MobileModal.module.scss';
import type { ModalProps } from './type';

const MobileModal = ({
  className,
  isOpen = false,
  children,
  cancelText = 'action.cancel',
  confirmText = 'action.confirm',
  cancelTextI18nProps,
  confirmTextI18nProps,
  onConfirm,
  onClose,
}: ModalProps) => {
  return (
    <ReactModal
      shouldCloseOnEsc
      role="dialog"
      isOpen={isOpen}
      className={classNames(styles.modal, className)}
      overlayClassName={classNames(modalStyles.overlay, styles.overlay)}
      onRequestClose={onClose}
    >
      <div className={styles.container}>
        <div className={styles.content}>{children}</div>
        <div className={styles.footer}>
          <Button
            title={cancelText}
            i18nProps={cancelTextI18nProps}
            type="secondary"
            onClick={onClose}
          />
          {onConfirm && (
            <Button title={confirmText} i18nProps={confirmTextI18nProps} onClick={onConfirm} />
          )}
        </div>
      </div>
    </ReactModal>
  );
};

export default MobileModal;
