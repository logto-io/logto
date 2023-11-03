import { useContext } from 'react';

import MauExceededModal from '@/components/MauExceededModal';
import PaymentOverdueModal from '@/components/PaymentOverdueModal';
import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';

import TenantEnvMigrationModal from './TenantEnvMigrationModal';

function TenantNotificationContainer() {
  const { currentTenant, isDevTenant } = useContext(TenantsContext);
  const isTenantSuspended = currentTenant?.isSuspended;

  if (!isCloud || isTenantSuspended) {
    return null;
  }

  return (
    <>
      {isDevFeaturesEnabled && !isDevTenant && (
        <>
          <MauExceededModal />
          <PaymentOverdueModal />
        </>
      )}
      {isDevFeaturesEnabled && <TenantEnvMigrationModal />}
    </>
  );
}

export default TenantNotificationContainer;
