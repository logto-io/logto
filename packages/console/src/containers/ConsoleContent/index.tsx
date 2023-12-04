import { useContext } from 'react';
import { Navigate, Route, Routes, useOutletContext } from 'react-router-dom';

import {
  ApiResourceDetailsTabs,
  ConnectorsTabs,
  UserDetailsTabs,
  RoleDetailsTabs,
  WebhookDetailsTabs,
  TenantSettingsTabs,
  ApplicationDetailsTabs,
  EnterpriseSsoDetailsTabs,
} from '@/consts';
import { isCloud } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import useUserPreferences from '@/hooks/use-user-preferences';
import ApiResourceDetails from '@/pages/ApiResourceDetails';
import ApiResourcePermissions from '@/pages/ApiResourceDetails/ApiResourcePermissions';
import ApiResourceSettings from '@/pages/ApiResourceDetails/ApiResourceSettings';
import ApiResources from '@/pages/ApiResources';
import ApplicationDetails from '@/pages/ApplicationDetails';
import Applications from '@/pages/Applications';
import AuditLogDetails from '@/pages/AuditLogDetails';
import AuditLogs from '@/pages/AuditLogs';
import ConnectorDetails from '@/pages/ConnectorDetails';
import Connectors from '@/pages/Connectors';
import Dashboard from '@/pages/Dashboard';
import EnterpriseSsoConnectors from '@/pages/EnterpriseSso';
import EnterpriseSsoConnectorDetails from '@/pages/EnterpriseSsoDetails';
import GetStarted from '@/pages/GetStarted';
import Mfa from '@/pages/Mfa';
import NotFound from '@/pages/NotFound';
import OrganizationDetails from '@/pages/OrganizationDetails';
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
import SignInExperience, { SignInExperienceTab } from '@/pages/SignInExperience';
import TenantSettings from '@/pages/TenantSettings';
import BillingHistory from '@/pages/TenantSettings/BillingHistory';
import Subscription from '@/pages/TenantSettings/Subscription';
import TenantBasicSettings from '@/pages/TenantSettings/TenantBasicSettings';
import TenantDomainSettings from '@/pages/TenantSettings/TenantDomainSettings';
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

import type { AppContentOutletContext } from '../AppContent/types';

import Sidebar from './Sidebar';
import * as styles from './index.module.scss';

function ConsoleContent() {
  const { scrollableContent } = useOutletContext<AppContentOutletContext>();
  const {
    data: { getStartedHidden },
  } = useUserPreferences();
  const { isDevTenant } = useContext(TenantsContext);

  return (
    <div className={styles.content}>
      <Sidebar />
      <OverlayScrollbar className={styles.overlayScrollbarWrapper}>
        <div ref={scrollableContent} className={styles.main}>
          <Routes>
            <Route path="*" element={<NotFound />} />
            {!getStartedHidden && <Route path="get-started" element={<GetStarted />} />}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="applications">
              <Route index element={<Applications />} />
              <Route path="create" element={<Applications />} />
              <Route path=":id/guide/:guideId" element={<ApplicationDetails />} />
              <Route path=":id">
                <Route index element={<Navigate replace to={ApplicationDetailsTabs.Settings} />} />
                <Route path=":tab" element={<ApplicationDetails />} />
              </Route>
            </Route>
            <Route path="api-resources">
              <Route index element={<ApiResources />} />
              <Route path="create" element={<ApiResources />} />
              <Route path=":id/guide/:guideId" element={<ApiResourceDetails />} />
              <Route path=":id" element={<ApiResourceDetails />}>
                <Route index element={<Navigate replace to={ApiResourceDetailsTabs.Settings} />} />
                <Route path={ApiResourceDetailsTabs.Settings} element={<ApiResourceSettings />} />
                <Route
                  path={ApiResourceDetailsTabs.Permissions}
                  element={<ApiResourcePermissions />}
                />
              </Route>
            </Route>
            <Route path="sign-in-experience">
              <Route index element={<Navigate replace to={SignInExperienceTab.Branding} />} />
              <Route path=":tab" element={<SignInExperience />} />
            </Route>
            <Route path="mfa" element={<Mfa />} />
            <Route path="connectors">
              <Route index element={<Navigate replace to={ConnectorsTabs.Passwordless} />} />
              <Route path=":tab" element={<Connectors />} />
              <Route path=":tab/create/:createType" element={<Connectors />} />
              <Route path=":tab/guide/:factoryId" element={<Connectors />} />
              <Route path=":tab/:connectorId" element={<ConnectorDetails />} />
            </Route>
            <Route path="enterprise-sso">
              <Route index element={<EnterpriseSsoConnectors />} />
              <Route path="create" element={<EnterpriseSsoConnectors />} />
              <Route path=":ssoConnectorId">
                <Route
                  index
                  element={<Navigate replace to={EnterpriseSsoDetailsTabs.Connection} />}
                />
                <Route path=":tab" element={<EnterpriseSsoConnectorDetails />} />
              </Route>
            </Route>
            <Route path="webhooks">
              <Route index element={<Webhooks />} />
              <Route path="create" element={<Webhooks />} />
              <Route path=":id" element={<WebhookDetails />}>
                <Route index element={<Navigate replace to={WebhookDetailsTabs.Settings} />} />
                <Route path={WebhookDetailsTabs.Settings} element={<WebhookSettings />} />
                <Route path={WebhookDetailsTabs.RecentRequests} element={<WebhookLogs />} />
              </Route>
              <Route
                path={`:hookId/${WebhookDetailsTabs.RecentRequests}/:logId`}
                element={<AuditLogDetails />}
              />
            </Route>
            <Route path="users">
              <Route index element={<Users />} />
              <Route path="create" element={<Users />} />
              <Route path=":id" element={<UserDetails />}>
                <Route index element={<Navigate replace to={UserDetailsTabs.Settings} />} />
                <Route path={UserDetailsTabs.Settings} element={<UserSettings />} />
                <Route path={UserDetailsTabs.Roles} element={<UserRoles />} />
                <Route path={UserDetailsTabs.Logs} element={<UserLogs />} />
                <Route path={UserDetailsTabs.Organizations} element={<UserOrganizations />} />
              </Route>
              <Route
                path={`:userId/${UserDetailsTabs.Logs}/:logId`}
                element={<AuditLogDetails />}
              />
            </Route>
            <Route path="audit-logs">
              <Route index element={<AuditLogs />} />
              <Route path=":logId" element={<AuditLogDetails />} />
            </Route>
            <Route path="roles">
              <Route index element={<Roles />} />
              <Route path="create" element={<Roles />} />
              <Route path=":id" element={<RoleDetails />}>
                <Route index element={<Navigate replace to={RoleDetailsTabs.Settings} />} />
                <Route path={RoleDetailsTabs.Settings} element={<RoleSettings />} />
                <Route path={RoleDetailsTabs.Permissions} element={<RolePermissions />} />
                <Route path={RoleDetailsTabs.Users} element={<RoleUsers />} />
                <Route path={RoleDetailsTabs.M2mApps} element={<RoleApplications />} />
              </Route>
            </Route>
            <Route path="organizations">
              <Route index element={<Organizations />} />
              <Route path="create" element={<Organizations />} />
              <Route path="template" element={<Organizations tab="template" />} />
              <Route path=":id/*" element={<OrganizationDetails />} />
            </Route>
            <Route path="organization-guide/*" element={<OrganizationGuide />} />
            <Route path="profile">
              <Route index element={<Profile />} />
              <Route path="verify-password" element={<VerifyPasswordModal />} />
              <Route path="change-password" element={<ChangePasswordModal />} />
              <Route path="link-email" element={<LinkEmailModal />} />
              <Route path="verification-code" element={<VerificationCodeModal />} />
            </Route>
            {isCloud && (
              <Route path="tenant-settings" element={<TenantSettings />}>
                <Route index element={<Navigate replace to={TenantSettingsTabs.Settings} />} />
                <Route path={TenantSettingsTabs.Settings} element={<TenantBasicSettings />} />
                <Route path={TenantSettingsTabs.Domains} element={<TenantDomainSettings />} />
                {!isDevTenant && (
                  <>
                    <Route path={TenantSettingsTabs.Subscription} element={<Subscription />} />
                    <Route path={TenantSettingsTabs.BillingHistory} element={<BillingHistory />} />
                  </>
                )}
              </Route>
            )}
          </Routes>
        </div>
      </OverlayScrollbar>
    </div>
  );
}

export default ConsoleContent;
