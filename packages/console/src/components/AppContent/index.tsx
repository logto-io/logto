import { useLogto } from '@logto/react';
import React, { useEffect } from 'react';
import { Outlet, useHref } from 'react-router-dom';

import ErrorBoundary from '../ErrorBoundary';
import LogtoLoading from '../LogtoLoading';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import * as styles from './index.module.scss';

const AppContent = () => {
  const { isAuthenticated, signIn } = useLogto();
  const href = useHref('/callback');

  useEffect(() => {
    if (!isAuthenticated) {
      void signIn(new URL(href, window.location.origin).toString());
    }
  }, [href, isAuthenticated, signIn]);

  if (!isAuthenticated) {
    return <LogtoLoading message="general.loading" />;
  }

  return (
    <ErrorBoundary>
      <div className={styles.app}>
        <Topbar />
        <div className={styles.content}>
          <Sidebar />
          <div className={styles.main}>
            <Outlet />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AppContent;
