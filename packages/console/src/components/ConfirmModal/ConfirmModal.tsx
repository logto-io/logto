import { AdminConsoleKey, I18nKey } from '@logto/phrases';
import React, { ReactNode } from 'react';
import ReactModal from 'react-modal';

import Button, { ButtonType } from '@/components/Button';
import * as modalStyles from '@/scss/modal.module.scss';

import ModalLayout from '../ModalLayout';
import * as styles from './index.module.scss';

export type ConfirmModalProps = {
  isOpen: boolean;
  content: ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
  title?: AdminConsoleKey;
  confirmButtonType?: ButtonType;
  confirmButtonText?: I18nKey;
  cancelButtonText?: I18nKey;
};

const ConfirmModal = ({
  content,
  title = 'form.confirm',
  confirmButtonType = 'danger',
  confirmButtonText = 'general.confirm',
  cancelButtonText = 'general.cancel',
  isOpen,
  onCancel,
  onConfirm,
}: ConfirmModalProps) => {
  return (
    <ReactModal
      isOpen={isOpen}
      className={modalStyles.content}
      overlayClassName={modalStyles.overlay}
    >
      <ModalLayout
        title={title}
        footer={
          <>
            <Button type="outline" title={cancelButtonText} onClick={onCancel} />
            <Button type={confirmButtonType} title={confirmButtonText} onClick={onConfirm} />
          </>
        }
        className={styles.content}
        onClose={onCancel}
      >
        <div className={styles.confirmation}>{content}</div>
      </ModalLayout>
    </ReactModal>
  );
};

export default ConfirmModal;
