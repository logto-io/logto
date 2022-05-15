import classNames from 'classnames';
import React from 'react';
import { isMobile } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import ReactModal from 'react-modal';

import Button from '@/components/Button';

import * as modalStyles from '../../scss/modal.module.scss';
import { CloseIcon } from '../Icons';
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
      onAfterOpen={() => {
        document.body.classList.add('static');
      }}
      onAfterClose={() => {
        document.body.classList.remove('static');
      }}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          {t('description.reminder')}
          <CloseIcon onClick={onClose} />
        </div>
        <div className={styles.content}>{children}</div>
        <div className={styles.footer}>
          <Button
            type={isMobile ? 'secondary' : 'outline'}
            size={isMobile ? 'large' : 'small'}
            onClick={onClose}
          >
            {t(cancelText)}
          </Button>
          <Button size={isMobile ? 'large' : 'small'} onClick={onConfirm ?? onClose}>
            {t(confirmText)}
          </Button>
        </div>
      </div>
    </ReactModal>
  );
};

export default AcModal;
