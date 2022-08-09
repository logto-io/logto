import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Button from '@/components/Button';

import * as modalStyles from '../../scss/modal.module.scss';
import * as styles from './MobileModal.module.scss';
import { ModalProps } from './type';

const MobileModal = ({
  className,
  isOpen = false,
  children,
  cancelText = 'action.cancel',
  confirmText = 'action.confirm',
  onConfirm,
  onClose,
}: ModalProps) => {
  const { t } = useTranslation();

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
          <Button type="secondary" onClick={onClose}>
            {t(cancelText)}
          </Button>
          <Button onClick={onConfirm ?? onClose}>{t(confirmText)}</Button>
        </div>
      </div>
    </ReactModal>
  );
};

export default MobileModal;
