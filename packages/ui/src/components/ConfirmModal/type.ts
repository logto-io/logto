import { ReactNode } from 'react';
import { TFuncKey } from 'react-i18next';

export type ModalProps = {
  className?: string;
  isOpen?: boolean;
  children: ReactNode;
  cancelText?: TFuncKey<'translation', 'main_flow'>;
  confirmText?: TFuncKey<'translation', 'main_flow'>;
  onConfirm?: () => void;
  onClose: () => void;
};
