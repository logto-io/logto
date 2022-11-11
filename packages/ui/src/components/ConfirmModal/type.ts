import type { ReactNode } from 'react';
import type { TFuncKey } from 'react-i18next';

export type ModalProps = {
  className?: string;
  isOpen?: boolean;
  children: ReactNode;
  cancelText?: TFuncKey;
  confirmText?: TFuncKey;
  onConfirm?: () => void;
  onClose: () => void;
};
