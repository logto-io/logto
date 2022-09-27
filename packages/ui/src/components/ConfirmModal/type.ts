import { ReactNode } from 'react';
import { TFuncKey } from 'react-i18next';

type ConfirmModalType = 'alert' | 'confirm';

export type ModalProps = {
  className?: string;
  isOpen?: boolean;
  type?: ConfirmModalType;
  children: ReactNode;
  cancelText?: TFuncKey;
  confirmText?: TFuncKey;
  onConfirm?: () => void;
  onClose: () => void;
};
