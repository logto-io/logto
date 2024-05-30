import { TenantTag } from '@logto/schemas';
import { useContext, useState } from 'react';

import { type TenantResponse } from '@/cloud/types/router';
import CreateTenantModal from '@/components/CreateTenantModal';
import { TenantsContext } from '@/contexts/TenantsProvider';
import TextLink from '@/ds-components/TextLink';

import * as styles from './index.module.scss';

function CreateProductionTenantBanner() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { tenants, prependTenant, navigateTenant } = useContext(TenantsContext);

  if (tenants.some((tenant) => tenant.tag === TenantTag.Production)) {
    return null;
  }

  return (
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
      <span>
        You&apos;re in a dev tenant for free testing. Create a production tenant to go live.{' '}
      </span>
      <TextLink
        onClick={() => {
          setIsCreateModalOpen(true);
        }}
      >
        Create tenant
      </TextLink>
    </div>
  );
}

export default CreateProductionTenantBanner;
