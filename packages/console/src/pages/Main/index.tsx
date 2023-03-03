import { useContext } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';

import AppLoading from '@/components/AppLoading';
import Toast from '@/components/Toast';
import {
  ApiResourceDetailsTabs,
  ConnectorsTabs,
  getBasename,
  RoleDetailsTabs,
  SignInExperiencePage,
  UserDetailsTabs,
} from '@/consts';
import AppBoundary from '@/containers/AppBoundary';
import AppContent from '@/containers/AppContent';
import AppLayout from '@/containers/AppLayout';
import { AppEndpointsContext } from '@/contexts/AppEndpointsProvider';
import useSwrOptions from '@/hooks/use-swr-options';
import ApiResourceDetails from '@/pages/ApiResourceDetails';
import ApiResourcePermissions from '@/pages/ApiResourceDetails/ApiResourcePermissions';
import ApiResourceSettings from '@/pages/ApiResourceDetails/ApiResourceSettings';
import ApiResources from '@/pages/ApiResources';
import ApplicationDetails from '@/pages/ApplicationDetails';
import Applications from '@/pages/Applications';
import AuditLogDetails from '@/pages/AuditLogDetails';
import AuditLogs from '@/pages/AuditLogs';
import Callback from '@/pages/Callback';
import ConnectorDetails from '@/pages/ConnectorDetails';
import Connectors from '@/pages/Connectors';
import Dashboard from '@/pages/Dashboard';
import GetStarted from '@/pages/GetStarted';
import NotFound from '@/pages/NotFound';
import Profile from '@/pages/Profile';
import RoleDetails from '@/pages/RoleDetails';
import RolePermissions from '@/pages/RoleDetails/RolePermissions';
import RoleSettings from '@/pages/RoleDetails/RoleSettings';
import RoleUsers from '@/pages/RoleDetails/RoleUsers';
import Roles from '@/pages/Roles';
import Settings from '@/pages/Settings';
import SignInExperience from '@/pages/SignInExperience';
import UserDetails from '@/pages/UserDetails';
import UserLogs from '@/pages/UserDetails/UserLogs';
import UserRoles from '@/pages/UserDetails/UserRoles';
import UserSettings from '@/pages/UserDetails/UserSettings';
import Users from '@/pages/Users';
import Welcome from '@/pages/Welcome';

import ChangePasswordModal from '../Profile/containers/ChangePasswordModal';
import VerifyPasswordModal from '../Profile/containers/VerifyPasswordModal';

const Main = () => {
  const swrOptions = useSwrOptions();
  const { userEndpoint } = useContext(AppEndpointsContext);

  if (!userEndpoint) {
    return <AppLoading />;
  }

  return (
    <BrowserRouter basename={getBasename()}>
      <SWRConfig value={swrOptions}>
        <AppBoundary>
          <Toast />
          <Routes>
            <Route path="callback" element={<Callback />} />
            <Route path="welcome" element={<Welcome />} />
            <Route element={<AppLayout />}>
              <Route element={<AppContent />}>
                <Route path="*" element={<NotFound />} />
                <Route path="get-started" element={<GetStarted />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="applications">
                  <Route index element={<Applications />} />
                  <Route path="create" element={<Applications />} />
                  <Route path=":id" element={<ApplicationDetails />} />
                </Route>
                <Route path="api-resources">
                  <Route index element={<ApiResources />} />
                  <Route path="create" element={<ApiResources />} />
                  <Route path=":id" element={<ApiResourceDetails />}>
                    <Route
                      index
                      element={<Navigate replace to={ApiResourceDetailsTabs.Settings} />}
                    />
                    <Route
                      path={ApiResourceDetailsTabs.Settings}
                      element={<ApiResourceSettings />}
                    />
                    <Route
                      path={ApiResourceDetailsTabs.Permissions}
                      element={<ApiResourcePermissions />}
                    />
                  </Route>
                </Route>
                <Route path="sign-in-experience">
                  <Route
                    index
                    element={<Navigate replace to={SignInExperiencePage.BrandingTab} />}
                  />
                  <Route path=":tab" element={<SignInExperience />} />
                </Route>
                <Route path="connectors">
                  <Route index element={<Navigate replace to={ConnectorsTabs.Passwordless} />} />
                  <Route path=":tab" element={<Connectors />} />
                  <Route path=":tab/create/:createType" element={<Connectors />} />
                  <Route path=":tab/:connectorId" element={<ConnectorDetails />} />
                </Route>
                <Route path="users">
                  <Route index element={<Users />} />
                  <Route path="create" element={<Users />} />
                  <Route path=":id" element={<UserDetails />}>
                    <Route index element={<Navigate replace to={UserDetailsTabs.Settings} />} />
                    <Route path={UserDetailsTabs.Settings} element={<UserSettings />} />
                    <Route path={UserDetailsTabs.Roles} element={<UserRoles />} />
                    <Route path={UserDetailsTabs.Logs} element={<UserLogs />} />
                  </Route>
                  <Route
                    path={`:id/${UserDetailsTabs.Logs}/:logId`}
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
                  </Route>
                </Route>
                <Route path="settings" element={<Settings />} />
                <Route path="profile">
                  <Route index element={<Profile />} />
                  <Route path="verify-password" element={<VerifyPasswordModal />} />
                  <Route path="change-password" element={<ChangePasswordModal />} />
                </Route>
              </Route>
            </Route>
          </Routes>
        </AppBoundary>
      </SWRConfig>
    </BrowserRouter>
  );
};

export default Main;
