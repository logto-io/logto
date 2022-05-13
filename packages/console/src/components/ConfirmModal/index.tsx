import { AdminConsoleKey, I18nKey } from '@logto/phrases';
import React from 'react';
import Modal from 'react-modal';

import * as modalStyles from '@/scss/modal.module.scss';

import Button from '../Button';
import ModalLayout from '../ModalLayout';

type Props = {
  title: AdminConsoleKey;
  children: React.ReactNode;
  className?: string;
  confirmButtonText?: I18nKey;
  cancelButtonText?: I18nKey;
  isOpen: boolean;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmModal = ({
  title,
  children,
  className,
  confirmButtonText = 'general.confirm',
  cancelButtonText = 'general.cancel',
  isOpen,
  isPending,
  onConfirm,
  onCancel,
}: Props) => (
  <Modal isOpen={isOpen} className={modalStyles.content} overlayClassName={modalStyles.overlay}>
    <ModalLayout
      title={title}
      footer={
        <>
          <Button type="outline" title={cancelButtonText} onClick={onCancel} />
          <Button
            isLoading={isPending}
            type="primary"
            title={confirmButtonText}
            onClick={onConfirm}
          />
        </>
      }
      className={className}
      onClose={onCancel}
    >
      {children}
    </ModalLayout>
  </Modal>
);

export default ConfirmModal;
