import React, { useEffect } from 'react';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';

import './scss/normalized.scss';
import * as styles from './App.module.scss';
import Content from './components/Content';
import Sidebar, { getPath, sections } from './components/Sidebar';
import Topbar from './components/Topbar';
import initI18n from './i18n/init';

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
    <div className={styles.app}>
      <Topbar />
      <div className={styles.content}>
        <Sidebar />
        <Content />
      </div>
    </div>
  );
};

const App = () => (
  <BrowserRouter>
    <Main />
  </BrowserRouter>
);

export default App;
