import { LogtoProvider } from '@logto/react';
import { adminConsoleApplicationId, managementResource } from '@logto/schemas/lib/seeds';
import { getBasename } from '@logto/shared';
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';
import './scss/normalized.scss';
// eslint-disable-next-line import/no-unassigned-import
import '@fontsource/roboto-mono';

import AppBoundary from './components/AppBoundary';
import AppContent from './components/AppContent';
import ErrorBoundary from './components/ErrorBoundary';
import Toast from './components/Toast';
import useSwrFetcher from './hooks/use-swr-fetcher';
import initI18n from './i18n/init';
import ApiResourceDetails from './pages/ApiResourceDetails';
import ApiResources from './pages/ApiResources';
import ApplicationDetails from './pages/ApplicationDetails';
import Applications from './pages/Applications';
import AuditLogs from './pages/AuditLogs';
import Callback from './pages/Callback';
import ConnectorDetails from './pages/ConnectorDetails';
import Connectors from './pages/Connectors';
import Dashboard from './pages/Dashboard';
import GetStarted from './pages/GetStarted';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import Settings from './pages/Settings';
import SignInExperience from './pages/SignInExperience';
import UserDetails from './pages/UserDetails';
import Users from './pages/Users';

void initI18n();

const Main = () => {
  const fetcher = useSwrFetcher();

  return (
    <ErrorBoundary>
      <SWRConfig value={{ fetcher }}>
        <AppBoundary>
          <Toast />
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="callback" element={<Callback />} />
            <Route path="register" element={<div>register</div>} />
            <Route element={<AppContent />}>
              <Route path="*" element={<NotFound />} />
              <Route path="get-started" element={<GetStarted />} />
              <Route path="applications">
                <Route index element={<Applications />} />
                <Route path=":id">
                  <Route index element={<Navigate to="settings" />} />
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
                <Route path=":id" element={<UserDetails />} />
              </Route>
              <Route path="sign-in-experience">
                <Route index element={<Navigate to="experience" />} />
                <Route path=":tab" element={<SignInExperience />} />
              </Route>
              <Route path="settings" element={<Settings />} />
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
              <Route path=":id" element={<UserDetails />} />
            </Route>
            <Route path="audit-logs">
              <Route index element={<AuditLogs />} />
            </Route>
            <Route path="sign-in-experience">
              <Route index element={<Navigate to="experience" />} />
              <Route path=":tab" element={<SignInExperience />} />
            </Route>
            <Route path="settings" element={<Settings />} />
            <Route path="dashboard" element={<Dashboard />} />
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
      }}
    >
      <Main />
    </LogtoProvider>
  </BrowserRouter>
);

export default App;
