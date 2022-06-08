import { LogtoProvider } from '@logto/react';
import { adminConsoleApplicationId, managementResource } from '@logto/schemas/lib/seeds';
import { getBasename } from '@logto/shared';
import React, { Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';

import './scss/normalized.scss';
// eslint-disable-next-line import/no-unassigned-import
import '@fontsource/roboto-mono';
import AppBoundary from '@/components/AppBoundary';
import ErrorBoundary from '@/components/ErrorBoundary';
import LogtoLoading from '@/components/LogtoLoading';
import Toast from '@/components/Toast';
import useSwrOptions from '@/hooks/use-swr-options';
import initI18n from '@/i18n/init';

const AppContent = React.lazy(async () => import('@/components/AppContent'));
const ApiResourceDetails = React.lazy(async () => import('@/pages/ApiResourceDetails'));
const ApiResources = React.lazy(async () => import('@/pages/ApiResources'));
const ApplicationDetails = React.lazy(async () => import('@/pages/ApplicationDetails'));
const Applications = React.lazy(async () => import('@/pages/Applications'));
const AuditLogs = React.lazy(async () => import('@/pages/AuditLogs'));
const Callback = React.lazy(async () => import('@/pages/Callback'));
const ConnectorDetails = React.lazy(async () => import('@/pages/ConnectorDetails'));
const Connectors = React.lazy(async () => import('@/pages/Connectors'));
const Dashboard = React.lazy(async () => import('@/pages/Dashboard'));
const GetStarted = React.lazy(async () => import('@/pages/GetStarted'));
const NotFound = React.lazy(async () => import('@/pages/NotFound'));
const Settings = React.lazy(async () => import('@/pages/Settings'));
const SignInExperience = React.lazy(async () => import('@/pages/SignInExperience'));
const UserDetails = React.lazy(async () => import('@/pages/UserDetails'));
const Users = React.lazy(async () => import('@/pages/Users'));

void initI18n();

const Main = () => {
  const swrOptions = useSwrOptions();

  return (
    <ErrorBoundary>
      <SWRConfig value={swrOptions}>
        <AppBoundary>
          <Toast />
          <Suspense fallback={<LogtoLoading message="general.loading" />}>
            <Routes>
              <Route path="callback" element={<Callback />} />
              {/* TODO: add register route */}
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
                <Route path="audit-logs">
                  <Route index element={<AuditLogs />} />
                </Route>
                <Route path="dashboard" element={<Dashboard />} />
              </Route>
            </Routes>
          </Suspense>
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
