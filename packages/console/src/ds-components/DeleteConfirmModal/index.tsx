import type { AdminConsoleKey } from '@logto/phrases';
import type { ReactNode } from 'react';
import { useState } from 'react';

import ConfirmModal from '@/ds-components/ConfirmModal';
import TextInput from '@/ds-components/TextInput';

type Props = {
  isOpen: boolean;
  isLoading?: boolean;
  children: ReactNode;
  expectedInput?: string;
  inputPlaceholder?: string;
  className?: string;
  onCancel: () => void;
  onConfirm: () => void;
  title?: AdminConsoleKey;
  confirmButtonText?: AdminConsoleKey;
};

function DeleteConfirmModal({
  isOpen,
  isLoading = false,
  expectedInput,
  inputPlaceholder,
  children,
  className,
  onCancel,
  onConfirm,
  title,
  confirmButtonText,
}: Props) {
  const [input, setInput] = useState('');
  const isConfirmBlocked = Boolean(expectedInput) && input !== expectedInput;

  return (
    <ConfirmModal
      isOpen={isOpen}
      isLoading={isLoading}
      isConfirmButtonDisabled={isConfirmBlocked}
      confirmButtonText={confirmButtonText ?? 'general.delete'}
      className={className}
      title={title}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      {children}
      {expectedInput && (
        <TextInput
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          value={input}
          placeholder={inputPlaceholder}
          onChange={(event) => {
            setInput(event.currentTarget.value);
          }}
        />
      )}
    </ConfirmModal>
  );
}

export default DeleteConfirmModal;
