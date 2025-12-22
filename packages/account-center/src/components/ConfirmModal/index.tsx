import Button from '@experience/shared/components/Button';
import DynamicT from '@experience/shared/components/DynamicT';
import type { TFuncKey } from 'i18next';
import type { ReactNode } from 'react';
import ReactModal from 'react-modal';

import styles from './index.module.scss';

type Props = {
  readonly isOpen: boolean;
  readonly title: TFuncKey;
  readonly children: ReactNode;
  readonly confirmText?: TFuncKey;
  readonly cancelText?: TFuncKey;
  readonly isLoading?: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
};

const ConfirmModal = ({
  isOpen,
  title,
  children,
  confirmText = 'action.continue',
  cancelText = 'action.cancel',
  isLoading,
  onConfirm,
  onCancel,
}: Props) => {
  return (
    <ReactModal
      shouldCloseOnEsc
      shouldCloseOnOverlayClick
      isOpen={isOpen}
      className={styles.modal}
      overlayClassName={styles.overlay}
      onRequestClose={onCancel}
    >
      <div className={styles.header}>
        <DynamicT forKey={title} />
      </div>
      <div className={styles.content}>{children}</div>
      <div className={styles.footer}>
        <Button title={cancelText} type="secondary" onClick={onCancel} />
        <Button title={confirmText} type="primary" isLoading={isLoading} onClick={onConfirm} />
      </div>
    </ReactModal>
  );
};

export default ConfirmModal;
