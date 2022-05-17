import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import CloseIcon from '@/assets/icons/close-icon.svg';
import Button from '@/components/Button';

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
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });

  return (
    <ReactModal
      role="dialog"
      isOpen={isOpen}
      className={classNames(styles.modal, className)}
      overlayClassName={classNames(modalStyles.overlay, styles.overlay)}
      appElement={document.querySelector('main') ?? undefined}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          {t('description.reminder')}
          <CloseIcon onClick={onClose} />
        </div>
        <div className={styles.content}>{children}</div>
        <div className={styles.footer}>
          <Button type="outline" size="small" onClick={onClose}>
            {t(cancelText)}
          </Button>
          <Button size="small" onClick={onConfirm ?? onClose}>
            {t(confirmText)}
          </Button>
        </div>
      </div>
    </ReactModal>
  );
};

export default AcModal;
