import { condArray } from '@silverhand/essentials';
import { useContext, useMemo } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { safeLazy } from 'react-safe-lazy';

import { TenantSettingsTabs } from '@/consts';
import { isCloud } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';
import NotFound from '@/pages/NotFound';
import { shouldShowOssTenantMembersTab } from '@/pages/OssTenantSettings/utils';

const TenantSettings = safeLazy(async () => import('@/pages/TenantSettings'));
const OssTenantSettings = safeLazy(async () => import('@/pages/OssTenantSettings'));
const OssTenantMembers = safeLazy(async () => import('@/pages/OssTenantSettings/Members'));
const TenantBasicSettings = safeLazy(
  async () => import('@/pages/TenantSettings/TenantBasicSettings')
);
const TenantDomainSettings = safeLazy(
  async () => import('@/pages/TenantSettings/TenantDomainSettings')
);
const TenantMembers = safeLazy(async () => import('@/pages/TenantSettings/TenantMembers'));
const Invitations = safeLazy(
  async () => import('@/pages/TenantSettings/TenantMembers/Invitations')
);
const Members = safeLazy(async () => import('@/pages/TenantSettings/TenantMembers/Members'));
const BillingHistory = safeLazy(async () => import('@/pages/TenantSettings/BillingHistory'));
const Subscription = safeLazy(async () => import('@/pages/TenantSettings/Subscription'));
const OidcConfigs = safeLazy(async () => import('@/components/OidcConfigs'));

const useCloudTenantSettings = () => {
  const { isDevTenant } = useContext(TenantsContext);
  const {
    currentSubscription: { quotaScope },
  } = useContext(SubscriptionDataContext);
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
        { path: TenantSettingsTabs.OidcConfigs, element: <OidcConfigs /> },
        !isDevTenant &&
          canManageTenant && [
            { path: TenantSettingsTabs.Subscription, element: <Subscription /> },
            ...condArray(
              // Hide the billing history page if the tenant is associated with a shared enterprise subscription
              quotaScope !== 'shared' && [
                { path: TenantSettingsTabs.BillingHistory, element: <BillingHistory /> },
              ]
            ),
          ]
      ),
    }),
    [canInviteMember, canManageTenant, isDevTenant, quotaScope]
  );

  return tenantSettings;
};

const useOssTenantSettings = (): RouteObject =>
  useMemo(() => {
    const shouldShowMembersTab = shouldShowOssTenantMembersTab({ isCloud: false });

    return {
      path: 'tenant-settings',
      element: <OssTenantSettings />,
      children: [
        {
          index: true,
          element: <Navigate replace to={TenantSettingsTabs.OidcConfigs} />,
        },
        {
          path: TenantSettingsTabs.OidcConfigs,
          element: <OidcConfigs />,
        },
        ...condArray(
          shouldShowMembersTab && [
            {
              path: TenantSettingsTabs.Members,
              element: <OssTenantMembers />,
            },
          ]
        ),
      ],
    };
  }, []);

export const useTenantSettings = isCloud ? useCloudTenantSettings : useOssTenantSettings;
