import { condArray } from '@silverhand/essentials';
import { useContext, useMemo } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { safeLazy } from 'react-safe-lazy';

import { TenantSettingsTabs } from '@/consts';
import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';
import NotFound from '@/pages/NotFound';
import {
  shouldShowOssTenantLicenseTab,
  shouldShowOssTenantMembersTab,
} from '@/pages/OssTenantSettings/utils';

const TenantSettings = safeLazy(async () => import('@/pages/TenantSettings'));
const OssTenantSettings = safeLazy(async () => import('@/pages/OssTenantSettings'));
const OssTenantMembers = safeLazy(async () => import('@/pages/OssTenantSettings/Members'));
const OssTenantLicense = safeLazy(async () => import('@/pages/OssTenantSettings/License'));
const OssTenantBasicSettings = safeLazy(async () => import('@/pages/OssTenantSettings/Settings'));
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

const useOssTenantSettings = (): RouteObject => {
  const {
    access: { canInviteMember },
  } = useCurrentTenantScopes();

  return useMemo(() => {
    const shouldShowMembersTab = shouldShowOssTenantMembersTab({ isCloud: false });
    const shouldShowLicenseTab = shouldShowOssTenantLicenseTab({
      isCloud: false,
      isDevFeaturesEnabled,
    });

    return {
      path: 'tenant-settings',
      element: <OssTenantSettings />,
      children: [
        {
          index: true,
          element: <Navigate replace to={TenantSettingsTabs.OidcConfigs} />,
        },
        // Self-hosted plans: mandatory Console MFA ships with the unlaunched self-hosted Pro and
        // Enterprise plans. The route does not follow the async entitlement and requirement state,
        // which only decide the tab link, so the page never turns into NotFound while in use.
        ...condArray(
          isDevFeaturesEnabled && [
            {
              path: TenantSettingsTabs.Settings,
              element: <OssTenantBasicSettings />,
            },
          ]
        ),
        {
          path: TenantSettingsTabs.OidcConfigs,
          element: <OidcConfigs />,
        },
        ...condArray(
          shouldShowMembersTab && [
            {
              path: `${TenantSettingsTabs.Members}/*`,
              element: <OssTenantMembers />,
              // Only rendered when the license grants Console collaboration; the upsell has no
              // child routes.
              children: [
                { path: '*', element: <NotFound /> },
                { index: true, element: <Members /> },
                ...condArray(
                  canInviteMember && [{ path: 'invitations', element: <Invitations /> }]
                ),
              ],
            },
          ]
        ),
        ...condArray(
          shouldShowLicenseTab && [
            {
              path: TenantSettingsTabs.License,
              element: <OssTenantLicense />,
            },
          ]
        ),
      ],
    };
  }, [canInviteMember]);
};

export const useTenantSettings = isCloud ? useCloudTenantSettings : useOssTenantSettings;
