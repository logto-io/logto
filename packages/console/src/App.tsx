import { LogtoProvider } from '@logto/react';
import { adminConsoleApplicationId, managementResource } from '@logto/schemas/lib/seeds';
import { getBasename, UserScope } from '@logto/shared';
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
import Settings from '@/pages/Settings';
import SignInExperience from '@/pages/SignInExperience';
import UserDetails from '@/pages/UserDetails';
import Users from '@/pages/Users';
import Welcome from '@/pages/Welcome';

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
              <Route path="applications">
                <Route index element={<Applications />} />
                <Route path="create" element={<Applications />} />
                <Route path=":id">
                  <Route index element={<Navigate replace to="settings" />} />
                  <Route path="settings" element={<ApplicationDetails />} />
                  <Route path="advanced-settings" element={<ApplicationDetails />} />
                </Route>
              </Route>
              <Route path="api-resources">
                <Route index element={<ApiResources />} />
                <Route path=":id" element={<ApiResourceDetails />} />
              </Route>
              <Route path="connectors">
                <Route index element={<Connectors />} />
                <Route path="social" element={<Connectors />} />
                <Route path=":connectorId" element={<ConnectorDetails />} />
              </Route>
              <Route path="users">
                <Route index element={<Users />} />
                <Route path=":userId" element={<UserDetails />} />
                <Route path=":userId/logs" element={<UserDetails />} />
                <Route path=":userId/logs/:logId" element={<AuditLogDetails />} />
              </Route>
              <Route path="sign-in-experience">
                <Route index element={<Navigate replace to="branding" />} />
                <Route path=":tab" element={<SignInExperience />} />
              </Route>
              <Route path="settings" element={<Settings />} />
              <Route path="audit-logs">
                <Route index element={<AuditLogs />} />
                <Route path=":logId" element={<AuditLogDetails />} />
              </Route>
              <Route path="dashboard" element={<Dashboard />} />
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
        scopes: [UserScope.Identities, UserScope.CustomData],
      }}
    >
      <Main />
    </LogtoProvider>
  </BrowserRouter>
);

export default App;
