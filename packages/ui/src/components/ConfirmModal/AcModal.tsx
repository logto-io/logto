import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import CloseIcon from '@/assets/icons/close-icon.svg';
import Button from '@/components/Button';
import IconButton from '@/components/Button/IconButton';

import * as modalStyles from '../../scss/modal.module.scss';
import * as styles from './Acmodal.module.scss';
import { ModalProps } from './type';

const AcModal = ({
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
        <div className={styles.header}>
          {t('description.reminder')}
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </div>
        <div className={styles.content}>{children}</div>
        <div className={styles.footer}>
          <Button title={cancelText} type="outline" size="small" onClick={onClose} />
          <Button title={confirmText} size="small" onClick={onConfirm ?? onClose} />
        </div>
      </div>
    </ReactModal>
  );
};

export default AcModal;
