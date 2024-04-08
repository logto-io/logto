import type { AdminConsoleKey } from '@logto/phrases';
import classNames from 'classnames';
import type { ReactElement, ReactNode } from 'react';
import ReactModal from 'react-modal';

import type { ButtonType } from '@/ds-components/Button';
import Button from '@/ds-components/Button';
import * as modalStyles from '@/scss/modal.module.scss';

import type DangerousRaw from '../DangerousRaw';
import ModalLayout from '../ModalLayout';
import type { Props as ModalLayoutProps } from '../ModalLayout';

import * as styles from './index.module.scss';

export type ConfirmModalProps = {
  children: ReactNode;
  className?: string;
  title?: AdminConsoleKey | ReactElement<typeof DangerousRaw>;
  subtitle?: AdminConsoleKey | ReactElement<typeof DangerousRaw>;
  confirmButtonType?: ButtonType;
  confirmButtonText?: AdminConsoleKey | ReactElement<typeof DangerousRaw>;
  cancelButtonText?: AdminConsoleKey | ReactElement<typeof DangerousRaw>;
  isOpen: boolean;
  isConfirmButtonDisabled?: boolean;
  isLoading?: boolean;
  isCancelButtonVisible?: boolean;
  size?: ModalLayoutProps['size'];
  onCancel?: () => void;
  onConfirm?: () => void;
};

function ConfirmModal({
  children,
  className,
  title = 'general.reminder',
  subtitle,
  confirmButtonType = 'danger',
  confirmButtonText = 'general.confirm',
  cancelButtonText = 'general.cancel',
  isOpen,
  isConfirmButtonDisabled = false,
  isLoading = false,
  isCancelButtonVisible = true,
  size,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <ReactModal
      shouldCloseOnEsc
      isOpen={isOpen}
      className={classNames(modalStyles.content)}
      overlayClassName={classNames(modalStyles.overlay, styles.overlay)}
      onRequestClose={onCancel}
    >
      <ModalLayout
        title={title}
        subtitle={subtitle}
        className={classNames(styles.content, className)}
        size={size}
        footer={
          <>
            {isCancelButtonVisible && onCancel && (
              <Button title={cancelButtonText} onClick={onCancel} />
            )}
            {onConfirm && (
              <Button
                type={confirmButtonType}
                title={confirmButtonText}
                disabled={isConfirmButtonDisabled}
                isLoading={isLoading}
                onClick={onConfirm}
              />
            )}
          </>
        }
        onClose={onCancel}
      >
        {children}
      </ModalLayout>
    </ReactModal>
  );
}

export default ConfirmModal;
