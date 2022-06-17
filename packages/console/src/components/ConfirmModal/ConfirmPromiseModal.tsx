import React from 'react';
import { create, InstanceProps } from 'react-modal-promise';

import ConfirmModal, { ConfirmModalProps } from './ConfirmModal';

export type ConfirmPromiseModalProps = Omit<
  ConfirmModalProps & InstanceProps<boolean>,
  'onCancel' | 'onConfirm'
>;

type CustomConfirmPromiseModalProps = Omit<ConfirmModalProps, 'isOpen' | 'onCancel' | 'onConfirm'>;

const ConfirmPromiseModal = ({ onResolve, onReject, ...rest }: ConfirmPromiseModalProps) => (
  <ConfirmModal
    {...rest}
    onConfirm={() => {
      onResolve(true);
    }}
    onCancel={() => {
      onReject(false);
    }}
  />
);

export default ConfirmPromiseModal;

export const confirmModalPromise = async (customProps: CustomConfirmPromiseModalProps) => {
  try {
    await create(ConfirmPromiseModal)(customProps);

    return true;
  } catch {
    return false;
  }
};
