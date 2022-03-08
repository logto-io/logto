import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { SWRConfig } from 'swr';
import './scss/normalized.scss';

import * as styles from './App.module.scss';
import AppContent from './components/AppContent';
import Content from './components/Content';
import Sidebar, { getPath, sections } from './components/Sidebar';
import Topbar from './components/Topbar';
import initI18n from './i18n/init';
import ApiResources from './pages/ApiResources';
import Applications from './pages/Applications';
import Connectors from './pages/Connectors';
import Connector from './pages/Connectors/Connector';
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
      <AppContent theme="light">
        <Topbar />
        <div className={styles.content}>
          <Sidebar />
          <Content>
            <Routes>
              <Route path="api-resources" element={<ApiResources />} />
              <Route path="applications" element={<Applications />} />
              <Route path="connectors" element={<Connectors />} />
              <Route path="connectors/:connectorId" element={<Connector />} />
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
