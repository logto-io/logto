import { type LogtoActionKey } from '@logto/schemas';
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';

import ConfirmModal from '@/ds-components/ConfirmModal';
import useApi from '@/hooks/use-api';

import { getActionApiPath, invalidateActionCache } from './utils';

type Props = {
  readonly isOpen: boolean;
  readonly actionType?: LogtoActionKey;
  readonly onCancel: () => void;
};

function DeleteConfirmModal({ isOpen, actionType, onCancel }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [loading, setLoading] = useState(false);
  const { mutate } = useSWRConfig();
  const api = useApi();

  const onDelete = useCallback(async () => {
    if (!actionType) {
      onCancel();
      return;
    }

    setLoading(true);

    try {
      await api.delete(getActionApiPath(actionType));
      await invalidateActionCache(mutate, actionType);
      toast.success(t('actions.deleted'));
    } finally {
      setLoading(false);
      onCancel();
    }
  }, [api, actionType, mutate, onCancel, t]);

  return (
    <ConfirmModal
      title="actions.delete_modal_title"
      confirmButtonText="general.delete"
      isOpen={isOpen}
      isLoading={loading}
      onConfirm={onDelete}
      onCancel={onCancel}
    >
      {t('actions.delete_modal_content')}
    </ConfirmModal>
  );
}

export default DeleteConfirmModal;
