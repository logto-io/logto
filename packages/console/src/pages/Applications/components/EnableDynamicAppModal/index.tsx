import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';

import ConfirmModal from '@/ds-components/ConfirmModal';
import useApi from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import { cimdConfigEndpoint } from '../../hooks/use-dynamic-app';

type Props = {
  readonly onClose: () => void;
};

/**
 * Confirmation step for the dynamic app (CIMD) card. There is no application entity to create;
 * confirming turns on the tenant-level feature switch.
 */
function EnableDynamicAppModal({ onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();
  const { mutate } = useSWRConfig();
  const { navigate } = useTenantPathname();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);

    try {
      await api.patch(cimdConfigEndpoint, { json: { enabled: true } });
      await mutate(cimdConfigEndpoint);
    } finally {
      setIsSubmitting(false);
    }

    toast.success(t('applications.dynamic_app.enabled'));
    onClose();
    navigate('/applications/third-party-applications', { replace: true });
  };

  return (
    <ConfirmModal
      isOpen
      isLoading={isSubmitting}
      title="applications.dynamic_app.enable_confirm_modal.title"
      confirmButtonType="primary"
      confirmButtonText="general.enable"
      onCancel={onClose}
      onConfirm={handleConfirm}
    >
      {t('applications.dynamic_app.enable_confirm_modal.content')}
    </ConfirmModal>
  );
}

export default EnableDynamicAppModal;
