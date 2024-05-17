import { type LogtoJwtTokenKeyType } from '@logto/schemas';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';

import ConfirmModal from '@/ds-components/ConfirmModal';
import useApi from '@/hooks/use-api';
import { getApiPath } from '@/pages/CustomizeJwt/utils/path';

type Props = {
  readonly isOpen: boolean;
  readonly tokenType?: LogtoJwtTokenKeyType;
  readonly onCancel: () => void;
};

function DeleteConfirmModal({ isOpen, tokenType, onCancel }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [loading, setLoading] = useState(false);
  const { mutate } = useSWRConfig();

  const api = useApi();
  const apiLink = tokenType && getApiPath(tokenType);

  const onDelete = useCallback(async () => {
    // If no token type is provided, dismiss the modal
    if (!apiLink) {
      onCancel();
      return;
    }

    setLoading(true);

    try {
      // Delete the JWT customizer
      await api.delete(apiLink);
      // Mutate the SWR cache
      await mutate(getApiPath());
    } finally {
      setLoading(false);
      onCancel();
    }
  }, [api, apiLink, mutate, onCancel]);

  return (
    <ConfirmModal
      title="jwt_claims.delete_modal_title"
      confirmButtonText="general.delete"
      isOpen={isOpen}
      isLoading={loading}
      onConfirm={onDelete}
      onCancel={onCancel}
    >
      {t('jwt_claims.delete_modal_content')}
    </ConfirmModal>
  );
}

export default DeleteConfirmModal;
