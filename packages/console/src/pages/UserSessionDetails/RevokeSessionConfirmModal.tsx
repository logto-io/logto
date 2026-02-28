import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DeleteConfirmModal from '@/ds-components/DeleteConfirmModal';
import useApi from '@/hooks/use-api';

type Props = {
  readonly isOpen: boolean;
  readonly userId: string;
  readonly sessionId: string;
  readonly onCancel: () => void;
  readonly onRevokeCallback: () => void;
};

function RevokeSessionConfirmModal({
  isOpen,
  userId,
  sessionId,
  onCancel,
  onRevokeCallback,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();
  const [isLoading, setIsLoading] = useState(false);

  const onRevoke = useCallback(async () => {
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      await api.delete(`api/users/${userId}/sessions/${sessionId}`, {
        searchParams: new URLSearchParams({
          revokeGrants: 'true',
        }),
      });
    } finally {
      setIsLoading(false);
    }
  }, [api, isLoading, sessionId, userId]);

  return (
    <DeleteConfirmModal
      isOpen={isOpen}
      isLoading={isLoading}
      title="user_details.sessions.revoke_session"
      confirmButtonText="user_details.sessions.revoke_session"
      onCancel={onCancel}
      onConfirm={async () => {
        await onRevoke();
        onRevokeCallback();
      }}
    >
      {t('user_details.sessions.revoke_session_confirmation')}
    </DeleteConfirmModal>
  );
}

export default RevokeSessionConfirmModal;
