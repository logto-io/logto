import type { ReactNode, MouseEventHandler } from 'react';
import type { TFuncKey } from 'react-i18next';

export type ModalProps = {
  className?: string;
  isOpen?: boolean;
  children: ReactNode;
  cancelText?: TFuncKey;
  confirmText?: TFuncKey;
  onConfirm?: MouseEventHandler<HTMLButtonElement> & MouseEventHandler;
  onClose: MouseEventHandler<HTMLButtonElement> & MouseEventHandler;
};
