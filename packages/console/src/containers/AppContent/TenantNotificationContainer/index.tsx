import { useContext } from 'react';

import MauExceededModal from '@/components/MauExceededModal';
import PaymentOverdueModal from '@/components/PaymentOverdueModal';
import { isCloud } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';

function TenantNotificationContainer() {
  const { currentTenant, isDevTenant } = useContext(TenantsContext);
  const isTenantSuspended = currentTenant?.isSuspended;

  // Todo @xiaoyijun remove isDevFeaturesEnabled when the dev tenant feature is ready
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  if (!isCloud || isTenantSuspended || isDevTenant) {
    return null;
  }

  return (
    <>
      <MauExceededModal />
      <PaymentOverdueModal />
    </>
  );
}

export default TenantNotificationContainer;
