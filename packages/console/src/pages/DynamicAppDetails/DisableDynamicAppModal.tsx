import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';

import ConfirmModal from '@/ds-components/ConfirmModal';
import useApi from '@/hooks/use-api';
import { cimdConfigEndpoint } from '@/hooks/use-dynamic-app';
import useTenantPathname from '@/hooks/use-tenant-pathname';

type Props = {
  readonly onClose: () => void;
};

/** Disabling the dynamic app turns off the tenant-level feature switch, there is nothing to delete. */
function DisableDynamicAppModal({ onClose }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();
  const { mutate } = useSWRConfig();
  const { navigate } = useTenantPathname();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);

    try {
      await api.patch(cimdConfigEndpoint, { json: { enabled: false } });
      await mutate(cimdConfigEndpoint);
      toast.success(t('applications.dynamic_app.disabled'));
      onClose();
      navigate('/applications/third-party-applications', { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ConfirmModal
      isOpen
      isLoading={isSubmitting}
      title="applications.dynamic_app.disable_confirm_modal.title"
      confirmButtonText="general.disable"
      onCancel={onClose}
      onConfirm={handleConfirm}
    >
      {t('applications.dynamic_app.disable_confirm_modal.content')}
    </ConfirmModal>
  );
}

export default DisableDynamicAppModal;
