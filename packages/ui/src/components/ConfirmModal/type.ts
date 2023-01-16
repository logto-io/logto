import type { ReactNode } from 'react';
import type { TFuncKey } from 'react-i18next';

export type ModalProps = {
  className?: string;
  isOpen?: boolean;
  children: ReactNode;
  cancelText?: TFuncKey;
  confirmText?: TFuncKey;
  cancelTextI18nProps?: Record<string, string>;
  confirmTextI18nProps?: Record<string, string>;
  onConfirm?: () => void;
  onClose: () => void;
};
