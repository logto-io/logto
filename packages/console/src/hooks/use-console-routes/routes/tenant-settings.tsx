import { condArray } from '@silverhand/essentials';
import { useContext, useMemo } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';

import { TenantSettingsTabs } from '@/consts';
import { TenantsContext } from '@/contexts/TenantsProvider';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';
import NotFound from '@/pages/NotFound';
import TenantSettings from '@/pages/TenantSettings';
import BillingHistory from '@/pages/TenantSettings/BillingHistory';
import Subscription from '@/pages/TenantSettings/Subscription';
import TenantBasicSettings from '@/pages/TenantSettings/TenantBasicSettings';
import TenantDomainSettings from '@/pages/TenantSettings/TenantDomainSettings';
import TenantMembers from '@/pages/TenantSettings/TenantMembers';
import Invitations from '@/pages/TenantSettings/TenantMembers/Invitations';
import Members from '@/pages/TenantSettings/TenantMembers/Members';

export const useTenantSettings = () => {
  const { isDevTenant } = useContext(TenantsContext);
  const {
    access: { canInviteMember, canManageTenant },
  } = useCurrentTenantScopes();

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
        {
          path: `${TenantSettingsTabs.Members}/*`,
          element: <TenantMembers />,
          children: [
            { path: '*', element: <NotFound /> },
            { index: true, element: <Members /> },
            ...condArray(canInviteMember && [{ path: 'invitations', element: <Invitations /> }]),
          ],
        },
        { path: TenantSettingsTabs.Domains, element: <TenantDomainSettings /> },
        !isDevTenant &&
          canManageTenant && [
            { path: TenantSettingsTabs.Subscription, element: <Subscription /> },
            { path: TenantSettingsTabs.BillingHistory, element: <BillingHistory /> },
          ]
      ),
    }),
    [canInviteMember, canManageTenant, isDevTenant]
  );

  return tenantSettings;
};
