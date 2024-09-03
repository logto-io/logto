import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuthedCloudApi } from '@/cloud/hooks/use-cloud-api';
import FormCard from '@/components/FormCard';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useCurrentUser from '@/hooks/use-current-user';

import styles from './index.module.scss';

function LeaveCard() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { show: showModal } = useConfirmModal();
  const api = useAuthedCloudApi();
  const { currentTenantId, removeTenant, navigateTenant } = useContext(TenantsContext);
  const { user } = useCurrentUser();
  const [isLoading, setIsLoading] = useState(false);

  const onClickLeave = async () => {
    const [confirm] = await showModal({
      ModalContent: t('tenants.leave_tenant_modal.description'),
      type: 'confirm',
      confirmButtonText: 'tenants.leave_tenant_modal.leave_button',
    });

    if (!confirm || !user) {
      return;
    }

    setIsLoading(true);
    try {
      await api.delete(`/api/tenants/:tenantId/members/:userId`, {
        params: { tenantId: currentTenantId, userId: user.id },
      });
      removeTenant(currentTenantId);
      navigateTenant('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormCard title="tenants.leave_tenant_card.leave_tenant">
      <FormField title="tenants.leave_tenant_card.leave_tenant">
        <div className={styles.container}>
          <div className={styles.description}>
            {t('tenants.leave_tenant_card.leave_tenant_description')}
          </div>
          <Button
            type="default"
            title="tenants.leave_tenant_card.leave_tenant"
            isLoading={isLoading}
            onClick={onClickLeave}
          />
        </div>
      </FormField>
    </FormCard>
  );
}

export default LeaveCard;
