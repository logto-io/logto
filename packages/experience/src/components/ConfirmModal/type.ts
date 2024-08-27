import type { TFuncKey } from 'i18next';
import type { ReactNode } from 'react';

export type ModalProps = {
  className?: string;
  isOpen?: boolean;
  isConfirmLoading?: boolean;
  isCancelLoading?: boolean;
  children: ReactNode;
  cancelText?: TFuncKey;
  confirmText?: TFuncKey;
  cancelTextI18nProps?: Record<string, string>;
  confirmTextI18nProps?: Record<string, string>;
  onConfirm?: () => void;
  onClose: () => void;
};
