import { AdminConsoleKey } from '@logto/phrases';
import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import ConfirmModal from '@/components/ConfirmModal';
import TextInput from '@/components/TextInput';

import * as styles from './index.module.scss';

type Props = {
  isOpen: boolean;
  isLoading: boolean;
  expectedInput: string;
  messageTemplate: AdminConsoleKey;
  inputPlaceholder: string;
  onCancel: () => void;
  onConfirm: () => void;
};

const RequireInputConfirmModal = ({
  isOpen,
  isLoading,
  expectedInput,
  messageTemplate,
  inputPlaceholder,
  onCancel,
  onConfirm,
}: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const [input, setInput] = useState('');
  const inputMismatched = input !== expectedInput;

  return (
    <ConfirmModal
      isOpen={isOpen}
      isLoading={isLoading}
      isConfirmButtonDisabled={inputMismatched}
      confirmButtonText="general.delete"
      className={styles.content}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <div className={styles.description}>
        <Trans components={{ span: <span className={styles.highlight} /> }}>
          {t(messageTemplate, { name: expectedInput })}
        </Trans>
      </div>
      <TextInput
        autoFocus
        value={input}
        placeholder={inputPlaceholder}
        onChange={(event) => {
          setInput(event.currentTarget.value);
        }}
      />
    </ConfirmModal>
  );
};

export default RequireInputConfirmModal;
