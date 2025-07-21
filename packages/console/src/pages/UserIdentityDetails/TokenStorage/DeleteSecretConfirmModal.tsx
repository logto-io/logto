import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DeleteConfirmModal from '@/ds-components/DeleteConfirmModal';
import useApi from '@/hooks/use-api';

type Props = {
  readonly secretId: string;
  readonly connectorName: string;
  readonly isOpen: boolean;
  readonly onCancel: () => void;
  readonly onDeleteCallback: () => void;
};

function DeleteSecretConfirmModal({
  secretId,
  connectorName,
  isOpen,
  onCancel,
  onDeleteCallback,
}: Props) {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console',
  });

  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);

  const onDelete = useCallback(async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      await api.delete(`api/secrets/${secretId}`);
    } finally {
      setIsLoading(false);
    }
  }, [api, isLoading, secretId]);

  return (
    <DeleteConfirmModal
      isOpen={isOpen}
      isLoading={isLoading}
      onCancel={onCancel}
      onConfirm={async () => {
        await onDelete();
        onDeleteCallback();
      }}
    >
      {t('user_identity_details.delete_tokens.confirmation_message', {
        connectorName,
      })}
    </DeleteConfirmModal>
  );
}

export default DeleteSecretConfirmModal;
