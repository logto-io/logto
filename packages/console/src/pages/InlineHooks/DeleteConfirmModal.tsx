import { type LogtoInlineHookKey } from '@logto/schemas';
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';

import ConfirmModal from '@/ds-components/ConfirmModal';
import useApi from '@/hooks/use-api';

import { getInlineHookApiPath, invalidateInlineHookCache } from './utils';

type Props = {
  readonly isOpen: boolean;
  readonly hookType?: LogtoInlineHookKey;
  readonly onCancel: () => void;
};

function DeleteConfirmModal({ isOpen, hookType, onCancel }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [loading, setLoading] = useState(false);
  const { mutate } = useSWRConfig();
  const api = useApi();

  const onDelete = useCallback(async () => {
    if (!hookType) {
      onCancel();
      return;
    }

    setLoading(true);

    try {
      await api.delete(getInlineHookApiPath(hookType));
      await invalidateInlineHookCache(mutate, hookType);
      toast.success(t('inline_hooks.deleted'));
    } finally {
      setLoading(false);
      onCancel();
    }
  }, [api, hookType, mutate, onCancel, t]);

  return (
    <ConfirmModal
      title="inline_hooks.delete_modal_title"
      confirmButtonText="general.delete"
      isOpen={isOpen}
      isLoading={loading}
      onConfirm={onDelete}
      onCancel={onCancel}
    >
      {t('inline_hooks.delete_modal_content')}
    </ConfirmModal>
  );
}

export default DeleteConfirmModal;
