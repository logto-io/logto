import { UserScope } from '@logto/core-kit';
import { LogtoProvider } from '@logto/react';
import {
  adminConsoleApplicationId,
  managementResource,
  managementResourceScope,
} from '@logto/schemas';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';

import './scss/normalized.scss';
// eslint-disable-next-line import/no-unassigned-import
import '@fontsource/roboto-mono';
import AppBoundary from '@/components/AppBoundary';
import AppContent from '@/components/AppContent';
import ErrorBoundary from '@/components/ErrorBoundary';
import Toast from '@/components/Toast';
import useSwrOptions from '@/hooks/use-swr-options';
import initI18n from '@/i18n/init';
import ApiResourceDetails from '@/pages/ApiResourceDetails';
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
import RoleDetails from '@/pages/RoleDetails';
import Roles from '@/pages/Roles';
import Settings from '@/pages/Settings';
import SignInExperience from '@/pages/SignInExperience';
import UserDetails from '@/pages/UserDetails';
import Users from '@/pages/Users';
import Welcome from '@/pages/Welcome';

import {
  ApiResourceDetailsTabs,
  ConnectorsTabs,
  RoleDetailsTabs,
  SignInExperiencePage,
  UserDetailsTabs,
} from './consts/page-tabs';
import ApiResourcePermissions from './pages/ApiResourceDetails/ApiResourcePermissions';
import ApiResourceSettings from './pages/ApiResourceDetails/ApiResourceSettings';
import RolePermissions from './pages/RoleDetails/RolePermissions';
import RoleSettings from './pages/RoleDetails/RoleSettings';
import RoleUsers from './pages/RoleDetails/RoleUsers';
import UserLogs from './pages/UserDetails/UserLogs';
import UserRoles from './pages/UserDetails/UserRoles';
import UserSettings from './pages/UserDetails/UserSettings';
import { getBasename } from './utilities/router';

void initI18n();

const Main = () => {
  const swrOptions = useSwrOptions();

  return (
    <ErrorBoundary>
      <SWRConfig value={swrOptions}>
        <AppBoundary>
          <Toast />
          <Routes>
            <Route path="callback" element={<Callback />} />
            <Route path="welcome" element={<Welcome />} />
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
                  <Route path={ApiResourceDetailsTabs.Settings} element={<ApiResourceSettings />} />
                  <Route
                    path={ApiResourceDetailsTabs.Permissions}
                    element={<ApiResourcePermissions />}
                  />
                </Route>
              </Route>
              <Route path="sign-in-experience">
                <Route index element={<Navigate replace to={SignInExperiencePage.BrandingTab} />} />
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
                  <Route path={UserDetailsTabs.Logs} element={<UserLogs />}>
                    <Route path=":logId" element={<AuditLogDetails />} />
                  </Route>
                </Route>
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
            </Route>
          </Routes>
        </AppBoundary>
      </SWRConfig>
    </ErrorBoundary>
  );
};

const App = () => (
  <BrowserRouter basename={getBasename('console', '5002')}>
    <LogtoProvider
      config={{
        endpoint: window.location.origin,
        appId: adminConsoleApplicationId,
        resources: [managementResource.indicator],
        scopes: [UserScope.Identities, UserScope.CustomData, managementResourceScope.name],
      }}
    >
      <Main />
    </LogtoProvider>
  </BrowserRouter>
);

export default App;
