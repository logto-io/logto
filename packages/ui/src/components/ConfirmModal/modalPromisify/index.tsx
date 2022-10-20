import { InstanceProps } from 'react-modal-promise';

import { ConfirmModalMessage } from '@/types';

type Props = {
  isOpen?: boolean;
  onConfirm: () => void;
  onClose: (message?: ConfirmModalMessage) => void;
};

export const modalPromisify =
  (ConfirmModal: (props: Props) => JSX.Element) =>
  ({
    isOpen,
    onResolve,
    onReject,
  }: Omit<InstanceProps<boolean | ConfirmModalMessage>, 'open' | 'close'>) => {
    return (
      <ConfirmModal
        isOpen={isOpen}
        onConfirm={() => {
          onResolve(true);
        }}
        onClose={(message?: ConfirmModalMessage) => {
          onReject(message ?? false);
        }}
      />
    );
  };
