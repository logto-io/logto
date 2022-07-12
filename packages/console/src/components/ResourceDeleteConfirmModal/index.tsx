import { AdminConsoleKey } from '@logto/phrases';
import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import ConfirmModal from '@/components/ConfirmModal';
import TextInput from '@/components/TextInput';

import * as styles from './index.module.scss';

type Props = {
  isOpen: boolean;
  isLoading: boolean;
  resourceName: string;
  messageTemplate: AdminConsoleKey;
  inputPlaceholder: string;
  onCancel: () => void;
  onConfirm: () => void;
};

const ResourceDeleteConfirmModal = ({
  isOpen,
  isLoading,
  resourceName,
  messageTemplate,
  inputPlaceholder,
  onCancel,
  onConfirm,
}: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const [inputName, setInputName] = useState('');
  const inputMismatched = inputName !== resourceName;

  return (
    <ConfirmModal
      isOpen={isOpen}
      isLoading={isLoading}
      isConfirmDisabled={inputMismatched}
      confirmButtonText="general.delete"
      className={styles.content}
      onCancel={onCancel}
      onConfirm={onConfirm}
    >
      <div className={styles.description}>
        <Trans components={{ span: <span className={styles.highlight} /> }}>
          {t(messageTemplate, { name: resourceName })}
        </Trans>
      </div>
      <TextInput
        autoFocus
        value={inputName}
        placeholder={inputPlaceholder}
        onChange={(event) => {
          setInputName(event.currentTarget.value);
        }}
      />
    </ConfirmModal>
  );
};

export default ResourceDeleteConfirmModal;
