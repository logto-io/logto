import React, { useEffect } from 'react';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';

import './scss/normalized.scss';
import * as styles from './App.module.scss';
import AppContent from './components/AppContent';
import Content from './components/Content';
import Sidebar, { getPath, sections } from './components/Sidebar';
import Topbar from './components/Topbar';
import initI18n from './i18n/init';

const isProduction = process.env.NODE_ENV !== 'development' || process.env.PORT === '5002';

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
    <AppContent theme="light">
      <Topbar />
      <div className={styles.content}>
        <Sidebar />
        <Content />
      </div>
    </AppContent>
  );
};

const App = () => (
  <BrowserRouter basename={isProduction ? '/console' : ''}>
    <Main />
  </BrowserRouter>
);

export default App;
