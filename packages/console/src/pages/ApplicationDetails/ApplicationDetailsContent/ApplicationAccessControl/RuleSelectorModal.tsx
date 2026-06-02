import { type AdminConsoleKey } from '@logto/phrases';
import { type ReactNode } from 'react';

import ConfirmModal from '@/ds-components/ConfirmModal';

type Props = {
  readonly isOpen: boolean;
  readonly isLoading: boolean;
  readonly title: AdminConsoleKey;
  readonly subtitle: AdminConsoleKey;
  readonly children: ReactNode;
  readonly onClose: () => void;
  readonly onSubmit: () => Promise<void>;
};

function RuleSelectorModal({
  isOpen,
  isLoading,
  title,
  subtitle,
  children,
  onClose,
  onSubmit,
}: Props) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      isLoading={isLoading}
      title={title}
      subtitle={subtitle}
      confirmButtonType="primary"
      confirmButtonText="general.save"
      cancelButtonText="general.cancel"
      size="large"
      onCancel={onClose}
      onConfirm={onSubmit}
    >
      {children}
    </ConfirmModal>
  );
}

export default RuleSelectorModal;
