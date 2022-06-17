import React from 'react';
import { InstanceProps } from 'react-modal-promise';

import ConfirmModal, { ConfirmModalProps } from './ConfirmModal';

type ConfirmPromiseModalProps = Omit<
  ConfirmModalProps & InstanceProps<boolean>,
  'onCancel' | 'onConfirm'
>;

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
