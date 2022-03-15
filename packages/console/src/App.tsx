import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { SWRConfig } from 'swr';
import './scss/normalized.scss';

import * as styles from './App.module.scss';
import AppContent from './components/AppContent';
import Content from './components/Content';
import Sidebar, { getPath, sections } from './components/Sidebar';
import Toast from './components/Toast';
import Topbar from './components/Topbar';
import initI18n from './i18n/init';
import ApiResourceDetails from './pages/ApiResourceDetails';
import ApiResources from './pages/ApiResources';
import ApplicationDetails from './pages/ApplicationDetails';
import Applications from './pages/Applications';
import ConnectorDetails from './pages/ConnectorDetails';
import Connectors from './pages/Connectors';
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
    <SWRConfig value={{ fetcher }}>
      <Toast />
      <AppContent theme="light">
        <Topbar />
        <div className={styles.content}>
          <Sidebar />
          <Content>
            <Routes>
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
            </Routes>
          </Content>
        </div>
      </AppContent>
    </SWRConfig>
  );
};

const App = () => (
  <BrowserRouter basename={isBasenameNeeded ? '/console' : ''}>
    <Main />
  </BrowserRouter>
);

export default App;
