import { LogtoProvider } from '@logto/react';
import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { SWRConfig } from 'swr';
import './scss/normalized.scss';

import AppContent from './components/AppContent';
import { getPath, sections } from './components/AppContent/components/Sidebar';
import Callback from './components/Callback';
import Toast from './components/Toast';
import initI18n from './i18n/init';
import ApiResourceDetails from './pages/ApiResourceDetails';
import ApiResources from './pages/ApiResources';
import ApplicationDetails from './pages/ApplicationDetails';
import Applications from './pages/Applications';
import ConnectorDetails from './pages/ConnectorDetails';
import Connectors from './pages/Connectors';
import GetStarted from './pages/GetStarted';
import Users from './pages/Users';
import { fetcher } from './swr';

const isBasenameNeeded = process.env.NODE_ENV !== 'development' || process.env.PORT === '5002';

void initI18n();

const Main = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === '/') {
      navigate(getPath(sections[0]?.items[0]?.title ?? ''));
    }
  }, [location.pathname, navigate]);

  return (
    <LogtoProvider logtoConfig={{ endpoint: window.location.origin, clientId: 'foo' }}>
      <SWRConfig value={{ fetcher }}>
        <Toast />
        <Routes>
          <Route path="callback" element={<Callback />} />
          <Route element={<AppContent theme="light" />}>
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
            </Route>
          </Route>
        </Routes>
      </SWRConfig>
    </LogtoProvider>
  );
};

const App = () => (
  <BrowserRouter basename={isBasenameNeeded ? '/console' : ''}>
    <Main />
  </BrowserRouter>
);

export default App;
