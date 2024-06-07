import { TenantTag } from '@logto/schemas';
import { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';

import { type TenantResponse } from '@/cloud/types/router';
import CreateTenantModal from '@/components/CreateTenantModal';
import { TenantsContext } from '@/contexts/TenantsProvider';
import TextLink from '@/ds-components/TextLink';

import * as styles from './index.module.scss';

function CreateProductionTenantBanner() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { tenants, prependTenant, navigateTenant } = useContext(TenantsContext);
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.tenants.production_tenant_notification',
  });

  if (tenants.some((tenant) => tenant.tag === TenantTag.Production)) {
    return null;
  }

  return createPortal(
    <div className={styles.banner}>
      <CreateTenantModal
        isOpen={isCreateModalOpen}
        onClose={async (tenant?: TenantResponse) => {
          setIsCreateModalOpen(false);
          if (tenant) {
            prependTenant(tenant);
            navigateTenant(tenant.id);
          }
        }}
      />
      <span>{t('text')}</span>
      <TextLink
        onClick={() => {
          setIsCreateModalOpen(true);
        }}
      >
        {t('action')}
      </TextLink>
    </div>,
    document.body
  );
}

export default CreateProductionTenantBanner;
