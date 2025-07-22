import { type ReactElement, useCallback, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import DeleteConfirmModal from '@/ds-components/DeleteConfirmModal';
import useApi from '@/hooks/use-api';

type Props = {
  readonly isOpen: boolean;
  readonly target: string;
  readonly connectorName: ReactElement;
  readonly onCancel: () => void;
  readonly onDeleteCallback: () => void;
  readonly userId: string;
};

function DeleteSocialIdentityConfirmModal({
  userId,
  isOpen,
  target,
  connectorName,
  onCancel,
  onDeleteCallback,
}: Props) {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console',
  });

  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);

  const onDelete = useCallback(
    async (target: string) => {
      if (isLoading) {
        return;
      }

      setIsLoading(true);

      try {
        await api.delete(`api/users/${userId}/identities/${target}`);
      } finally {
        setIsLoading(false);
      }
    },
    [api, isLoading]
  );

  return (
    <DeleteConfirmModal
      isOpen={isOpen}
      isLoading={isLoading}
      onCancel={onCancel}
      onConfirm={async () => {
        await onDelete(target);
        onDeleteCallback();
      }}
    >
      <Trans
        t={t}
        i18nKey="user_details.connectors.deletion_confirmation"
        components={{
          name: connectorName,
        }}
      />
    </DeleteConfirmModal>
  );
}

export default DeleteSocialIdentityConfirmModal;
