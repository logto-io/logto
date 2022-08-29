import { InstanceProps } from 'react-modal-promise';

import { TermsOfUseModalMessage } from '@/types';

type Props = {
  isOpen?: boolean;
  onConfirm: () => void;
  onClose: (message?: TermsOfUseModalMessage) => void;
};

export const modalPromisify =
  (ConfirmModal: (props: Props) => JSX.Element) =>
  ({
    isOpen,
    onResolve,
    onReject,
  }: Omit<InstanceProps<boolean | TermsOfUseModalMessage>, 'open' | 'close'>) => {
    return (
      <ConfirmModal
        isOpen={isOpen}
        onConfirm={() => {
          onResolve(true);
        }}
        onClose={(message?: TermsOfUseModalMessage) => {
          onReject(message ?? false);
        }}
      />
    );
  };
