import { useContext } from 'react';

import MauTokenExceededModal from '@/components/MauTokenExceededModal';
import PaymentOverdueModal from '@/components/PaymentOverdueModal';
import { isCloud } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';

import CreateProductionTenantBanner from './CreateProductionTenantBanner';
import TenantEnvMigrationModal from './TenantEnvMigrationModal';

function TenantNotificationContainer() {
  const { currentTenant, isDevTenant } = useContext(TenantsContext);
  const isTenantSuspended = currentTenant?.isSuspended;

  if (!isCloud || isTenantSuspended) {
    return null;
  }

  return (
    <>
      {/* Note: we won't check the MAU limit, token limit and payment for dev tenants */}
      {!isDevTenant && (
        <>
          <MauTokenExceededModal />
          <PaymentOverdueModal />
        </>
      )}
      <CreateProductionTenantBanner />
      <TenantEnvMigrationModal />
    </>
  );
}

export default TenantNotificationContainer;
