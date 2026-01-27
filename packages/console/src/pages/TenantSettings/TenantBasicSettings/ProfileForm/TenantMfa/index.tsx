import { ReservedPlanId } from '@logto/schemas';
import { useContext, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { useAuthedCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type TenantSettingsResponse } from '@/cloud/types/router';
import { isCloud } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Switch from '@/ds-components/Switch';
import { type RequestError } from '@/hooks/use-api';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';

function TenantMfa() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const cloudApi = useAuthedCloudApi({ hideErrorToast: true });
  const { currentTenantId, isDevTenant } = useContext(TenantsContext);
  const {
    currentSubscription: { planId, isEnterprisePlan },
  } = useContext(SubscriptionDataContext);
  const {
    access: { canManageTenant },
  } = useCurrentTenantScopes();

  const [isUpdating, setIsUpdating] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<TenantSettingsResponse, RequestError>(
    isCloud && `api/tenants/${currentTenantId}/settings`,
    async () =>
      cloudApi.get(`/api/tenants/:tenantId/settings`, {
        params: { tenantId: currentTenantId },
      })
  );

  const isFreeOrDevPlan =
    planId === ReservedPlanId.Free || planId === ReservedPlanId.Development || isDevTenant;
  const isFeatureAvailable = !isFreeOrDevPlan || isEnterprisePlan;

  const handleToggle = async (checked: boolean) => {
    if (isUpdating || !isFeatureAvailable) {
      return;
    }

    setIsUpdating(true);
    try {
      const updated = await cloudApi.patch(`/api/tenants/:tenantId/settings`, {
        params: { tenantId: currentTenantId },
        body: { isMfaRequired: checked },
      });
      void mutate(updated);
      toast.success(t('general.saved'));
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isCloud || !canManageTenant) {
    return null;
  }

  return (
    <Switch
      label={t('tenants.settings.tenant_mfa_description')}
      disabled={!isFeatureAvailable || isLoading || isUpdating || Boolean(error)}
      checked={data?.isMfaRequired ?? false}
      onChange={async ({ currentTarget: { checked } }) => handleToggle(checked)}
    />
  );
}

export default TenantMfa;

export { default as useTenantMfaFeature } from './use-tenant-mfa-feature.js';
