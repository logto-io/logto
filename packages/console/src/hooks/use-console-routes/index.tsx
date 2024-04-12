import { condArray } from '@silverhand/essentials';
import { useContext, useMemo } from 'react';
import { Navigate, type RouteObject, useRoutes } from 'react-router-dom';

import {
  ApplicationDetailsTabs,
  ConnectorsTabs,
  EnterpriseSsoDetailsTabs,
  OrganizationTemplateTabs,
  RoleDetailsTabs,
  TenantSettingsTabs,
  UserDetailsTabs,
  WebhookDetailsTabs,
} from '@/consts';
import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';
import useCurrentTenantScopes from '@/hooks/use-current-tenant-scopes';
import ApiResourceDetails from '@/pages/ApiResourceDetails';
import ApiResources from '@/pages/ApiResources';
import ApplicationDetails from '@/pages/ApplicationDetails';
import Applications from '@/pages/Applications';
import AuditLogDetails from '@/pages/AuditLogDetails';
import AuditLogs from '@/pages/AuditLogs';
import ConnectorDetails from '@/pages/ConnectorDetails';
import Connectors from '@/pages/Connectors';
import CustomizeJwt from '@/pages/CustomizeJwt';
import CustomizeJwtDetails from '@/pages/CustomizeJwtDetails';
import Dashboard from '@/pages/Dashboard';
import EnterpriseSsoConnectors from '@/pages/EnterpriseSso';
import EnterpriseSsoConnectorDetails from '@/pages/EnterpriseSsoDetails';
import GetStarted from '@/pages/GetStarted';
import Mfa from '@/pages/Mfa';
import NotFound from '@/pages/NotFound';
import OrganizationDetails from '@/pages/OrganizationDetails';
import OrganizationRoleDetails from '@/pages/OrganizationRoleDetails';
import OrganizationTemplate from '@/pages/OrganizationTemplate';
import OrganizationPermissions from '@/pages/OrganizationTemplate/OrganizationPermissions';
import OrganizationRoles from '@/pages/OrganizationTemplate/OrganizationRoles';
import Organizations from '@/pages/Organizations';
import OrganizationGuide from '@/pages/Organizations/Guide';
import Profile from '@/pages/Profile';
import ChangePasswordModal from '@/pages/Profile/containers/ChangePasswordModal';
import LinkEmailModal from '@/pages/Profile/containers/LinkEmailModal';
import VerificationCodeModal from '@/pages/Profile/containers/VerificationCodeModal';
import VerifyPasswordModal from '@/pages/Profile/containers/VerifyPasswordModal';
import RoleDetails from '@/pages/RoleDetails';
import RoleApplications from '@/pages/RoleDetails/RoleApplications';
import RolePermissions from '@/pages/RoleDetails/RolePermissions';
import RoleSettings from '@/pages/RoleDetails/RoleSettings';
import RoleUsers from '@/pages/RoleDetails/RoleUsers';
import Roles from '@/pages/Roles';
import SignInExperience from '@/pages/SignInExperience';
import { SignInExperienceTab } from '@/pages/SignInExperience/types';
import SigningKeys from '@/pages/SigningKeys';
import TenantSettings from '@/pages/TenantSettings';
import BillingHistory from '@/pages/TenantSettings/BillingHistory';
import Subscription from '@/pages/TenantSettings/Subscription';
import TenantBasicSettings from '@/pages/TenantSettings/TenantBasicSettings';
import TenantDomainSettings from '@/pages/TenantSettings/TenantDomainSettings';
import TenantMembers from '@/pages/TenantSettings/TenantMembers';
import UserDetails from '@/pages/UserDetails';
import UserLogs from '@/pages/UserDetails/UserLogs';
import UserOrganizations from '@/pages/UserDetails/UserOrganizations';
import UserRoles from '@/pages/UserDetails/UserRoles';
import UserSettings from '@/pages/UserDetails/UserSettings';
import Users from '@/pages/Users';
import WebhookDetails from '@/pages/WebhookDetails';
import WebhookLogs from '@/pages/WebhookDetails/WebhookLogs';
import WebhookSettings from '@/pages/WebhookDetails/WebhookSettings';
import Webhooks from '@/pages/Webhooks';

export const useConsoleRoutes = () => {
  const { isDevTenant } = useContext(TenantsContext);
  const { canManageTenant } = useCurrentTenantScopes();

  const routeObjects: RouteObject[] = useMemo(
    () =>
      condArray(
        { path: '*', element: <NotFound /> },
        { path: 'get-started', element: <GetStarted /> },
        { path: 'dashboard', element: <Dashboard /> },
        {
          path: 'applications',
          children: [
            { index: true, element: <Applications /> },
            {
              path: 'third-party-applications',
              element: <Applications tab="thirdPartyApplications" />,
            },
            { path: 'create', element: <Applications /> },
            { path: ':id/guide/:guideId', element: <ApplicationDetails /> },
            {
              path: ':id',
              children: [
                { index: true, element: <Navigate replace to={ApplicationDetailsTabs.Settings} /> },
                { path: ':tab', element: <ApplicationDetails /> },
              ],
            },
            { path: `:appId/${ApplicationDetailsTabs.Logs}/:logId`, element: <AuditLogDetails /> },
          ],
        },
        {
          path: 'api-resources',
          children: [
            { index: true, element: <ApiResources /> },
            { path: 'create', element: <ApiResources /> },
            { path: ':id/guide/:guideId', element: <ApiResourceDetails /> },
            { path: ':id/*', element: <ApiResourceDetails /> },
          ],
        },
        {
          path: 'sign-in-experience',
          children: [
            { index: true, element: <Navigate replace to={SignInExperienceTab.Branding} /> },
            { path: ':tab', element: <SignInExperience /> },
          ],
        },
        { path: 'mfa', element: <Mfa /> },
        {
          path: 'connectors',
          children: [
            { index: true, element: <Navigate replace to={ConnectorsTabs.Passwordless} /> },
            { path: ':tab', element: <Connectors /> },
            { path: ':tab/create/:createType', element: <Connectors /> },
            { path: ':tab/guide/:factoryId', element: <Connectors /> },
            { path: ':tab/:connectorId', element: <ConnectorDetails /> },
          ],
        },
        {
          path: 'enterprise-sso',
          children: [
            { index: true, element: <EnterpriseSsoConnectors /> },
            { path: 'create', element: <EnterpriseSsoConnectors /> },
            {
              path: ':ssoConnectorId',
              children: [
                {
                  index: true,
                  element: <Navigate replace to={EnterpriseSsoDetailsTabs.Connection} />,
                },
                { path: ':tab', element: <EnterpriseSsoConnectorDetails /> },
              ],
            },
          ],
        },
        {
          path: 'webhooks',
          children: [
            { index: true, element: <Webhooks /> },
            { path: 'create', element: <Webhooks /> },
            {
              path: ':id',
              element: <WebhookDetails />,
              children: [
                { index: true, element: <Navigate replace to={WebhookDetailsTabs.Settings} /> },
                { path: WebhookDetailsTabs.Settings, element: <WebhookSettings /> },
                { path: WebhookDetailsTabs.RecentRequests, element: <WebhookLogs /> },
              ],
            },
            {
              path: `:hookId/${WebhookDetailsTabs.RecentRequests}/:logId`,
              element: <AuditLogDetails />,
            },
          ],
        },
        {
          path: 'users',
          children: [
            { index: true, element: <Users /> },
            { path: 'create', element: <Users /> },
            {
              path: ':id',
              element: <UserDetails />,
              children: [
                { index: true, element: <Navigate replace to={UserDetailsTabs.Settings} /> },
                { path: UserDetailsTabs.Settings, element: <UserSettings /> },
                { path: UserDetailsTabs.Roles, element: <UserRoles /> },
                { path: UserDetailsTabs.Logs, element: <UserLogs /> },
                { path: UserDetailsTabs.Organizations, element: <UserOrganizations /> },
              ],
            },
            { path: `:userId/${UserDetailsTabs.Logs}/:logId`, element: <AuditLogDetails /> },
          ],
        },
        {
          path: 'audit-logs',
          children: [
            { index: true, element: <AuditLogs /> },
            { path: ':logId', element: <AuditLogDetails /> },
          ],
        },
        {
          path: 'roles',
          children: [
            { index: true, element: <Roles /> },
            { path: 'create', element: <Roles /> },
            {
              path: ':id',
              element: <RoleDetails />,
              children: [
                { index: true, element: <Navigate replace to={RoleDetailsTabs.Settings} /> },
                { path: RoleDetailsTabs.Settings, element: <RoleSettings /> },
                { path: RoleDetailsTabs.Permissions, element: <RolePermissions /> },
                { path: RoleDetailsTabs.Users, element: <RoleUsers /> },
                { path: RoleDetailsTabs.M2mApps, element: <RoleApplications /> },
              ],
            },
          ],
        },
        isDevFeaturesEnabled && [
          {
            path: 'organization-template',
            element: <OrganizationTemplate />,
            children: [
              {
                index: true,
                element: <Navigate replace to={OrganizationTemplateTabs.OrganizationRoles} />,
              },
              { path: OrganizationTemplateTabs.OrganizationRoles, element: <OrganizationRoles /> },
              {
                path: OrganizationTemplateTabs.OrganizationPermissions,
                element: <OrganizationPermissions />,
              },
            ],
          },
          {
            path: `organization-template/${OrganizationTemplateTabs.OrganizationRoles}/:id/*`,
            element: <OrganizationRoleDetails />,
          },
        ],
        {
          path: 'organizations',
          children: condArray(
            { index: true, element: <Organizations /> },
            { path: 'create', element: <Organizations /> },
            !isDevFeaturesEnabled && {
              path: 'template',
              element: <Organizations tab="template" />,
            },
            { path: ':id/*', element: <OrganizationDetails /> }
          ),
        },
        !isDevFeaturesEnabled && { path: 'organization-guide/*', element: <OrganizationGuide /> },
        {
          path: 'profile',
          children: [
            { index: true, element: <Profile /> },
            { path: 'verify-password', element: <VerifyPasswordModal /> },
            { path: 'change-password', element: <ChangePasswordModal /> },
            { path: 'link-email', element: <LinkEmailModal /> },
            { path: 'verification-code', element: <VerificationCodeModal /> },
          ],
        },
        { path: 'signing-keys', element: <SigningKeys /> },
        isCloud && {
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
        },
        isCloud &&
          isDevFeaturesEnabled && {
            path: 'customize-jwt',
            children: [
              { index: true, element: <CustomizeJwt /> },
              { path: ':tokenType/:action', element: <CustomizeJwtDetails /> },
            ],
          }
      ),
    [canManageTenant, isDevTenant]
  );
  const routes = useRoutes(routeObjects);

  return routes;
};
