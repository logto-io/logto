import { LogtoProvider } from '@logto/react';
import { adminConsoleApplicationId, managementApiResource } from '@logto/schemas';
import { getBasename } from '@logto/shared';
import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { SWRConfig } from 'swr';
import './scss/normalized.scss';
// eslint-disable-next-line import/no-unassigned-import
import '@fontsource/roboto-mono';

import AppContent from './components/AppContent';
import ErrorBoundary from './components/ErrorBoundary';
import Toast from './components/Toast';
import useSwrFetcher from './hooks/use-swr-fetcher';
import initI18n from './i18n/init';
import ApiResourceDetails from './pages/ApiResourceDetails';
import ApiResources from './pages/ApiResources';
import ApplicationDetails from './pages/ApplicationDetails';
import Applications from './pages/Applications';
import Callback from './pages/Callback';
import ConnectorDetails from './pages/ConnectorDetails';
import Connectors from './pages/Connectors';
import GetStarted from './pages/GetStarted';
import NotFound from './pages/NotFound';
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
        <Toast />
        <Routes>
          <Route path="callback" element={<Callback />} />
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
        </Routes>
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
        resources: [managementApiResource],
      }}
    >
      <Main />
    </LogtoProvider>
  </BrowserRouter>
);

export default App;
