import { condArray } from '@silverhand/essentials';
import { useContext, useMemo } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';

import { TenantSettingsTabs } from '@/consts';
import { TenantsContext } from '@/contexts/TenantsProvider';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';
import TenantSettings from '@/pages/TenantSettings';
import BillingHistory from '@/pages/TenantSettings/BillingHistory';
import Subscription from '@/pages/TenantSettings/Subscription';
import TenantBasicSettings from '@/pages/TenantSettings/TenantBasicSettings';
import TenantDomainSettings from '@/pages/TenantSettings/TenantDomainSettings';
import TenantMembers from '@/pages/TenantSettings/TenantMembers';

export const useTenantSettings = () => {
  const { isDevTenant } = useContext(TenantsContext);
  const { canManageTenant } = useCurrentTenantScopes();

  const tenantSettings: RouteObject = useMemo(
    () => ({
      path: 'tenant-settings',
      element: <TenantSettings />,
      children: condArray(
        {
          index: true,
          element: (
            <Navigate
              replace
              to={canManageTenant ? TenantSettingsTabs.Settings : TenantSettingsTabs.Members}
            />
          ),
        },
        { path: TenantSettingsTabs.Settings, element: <TenantBasicSettings /> },
        { path: `${TenantSettingsTabs.Members}/*`, element: <TenantMembers /> },
        { path: TenantSettingsTabs.Domains, element: <TenantDomainSettings /> },
        !isDevTenant &&
          canManageTenant && [
            { path: TenantSettingsTabs.Subscription, element: <Subscription /> },
            { path: TenantSettingsTabs.BillingHistory, element: <BillingHistory /> },
          ]
      ),
    }),
    [canManageTenant, isDevTenant]
  );

  return tenantSettings;
};
