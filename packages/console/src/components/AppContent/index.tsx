import { LogtoClientError, useLogto } from '@logto/react';
import React, { useEffect } from 'react';
import { Outlet, useHref, useLocation, useNavigate } from 'react-router-dom';

import AppError from '@/components/AppError';
import LogtoLoading from '@/components/LogtoLoading';
import SessionExpired from '@/components/SessionExpired';
import useAdminConsoleConfigs from '@/hooks/use-configs';

import Sidebar, { getPath } from './components/Sidebar';
import { useSidebarMenuItems } from './components/Sidebar/hook';
import Topbar from './components/Topbar';
import * as styles from './index.module.scss';

const AppContent = () => {
  const { isAuthenticated, error, signIn } = useLogto();
  const href = useHref('/callback');
  const { configs, error: configsError } = useAdminConsoleConfigs();
  const isLoadingConfigs = !configs && !configsError;

  const location = useLocation();
  const navigate = useNavigate();
  const sections = useSidebarMenuItems();

  useEffect(() => {
    if (!isAuthenticated) {
      void signIn(new URL(href, window.location.origin).toString());
    }
  }, [href, isAuthenticated, signIn]);

  useEffect(() => {
    // Navigate to the first menu item after configs are loaded.
    if (configs && location.pathname === '/') {
      navigate(getPath(sections[0]?.items[0]?.title ?? ''));
    }
  }, [location.pathname, configs, sections, navigate]);

  if (error) {
    if (error instanceof LogtoClientError) {
      return <SessionExpired />;
    }

    return <AppError errorMessage={error.message} callStack={error.stack} />;
  }

  if (!isAuthenticated || isLoadingConfigs) {
    return <LogtoLoading message="general.loading" />;
  }

  return (
    <div className={styles.app}>
      <Topbar />
      <div className={styles.content}>
        <Sidebar />
        <div className={styles.main}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AppContent;
