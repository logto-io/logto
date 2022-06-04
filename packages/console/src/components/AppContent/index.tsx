import { LogtoClientError, useLogto } from '@logto/react';
import React, { useEffect } from 'react';
import { Outlet, useHref, useLocation, useNavigate } from 'react-router-dom';

import AppError from '@/components/AppError';
import LogtoLoading from '@/components/LogtoLoading';
import SessionExpired from '@/components/SessionExpired';
import useSettings from '@/hooks/use-settings';
import useUserPreferences from '@/hooks/use-user-preferences';

import Sidebar, { getPath } from './components/Sidebar';
import { useSidebarMenuItems } from './components/Sidebar/hook';
import Topbar from './components/Topbar';
import * as styles from './index.module.scss';

const AppContent = () => {
  const { isAuthenticated, error, signIn } = useLogto();
  const href = useHref('/callback');
  const { isLoading: isPreferencesLoading } = useUserPreferences();
  const { isLoading: isSettingsLoading } = useSettings();
  const isLoading = isPreferencesLoading || isSettingsLoading;

  const location = useLocation();
  const navigate = useNavigate();
  const [, firstItem] = useSidebarMenuItems();

  useEffect(() => {
    if (!isAuthenticated) {
      void signIn(new URL(href, window.location.origin).toString());
    }
  }, [href, isAuthenticated, signIn]);

  useEffect(() => {
    // Navigate to the first menu item after configs are loaded.
    if (!isLoading && location.pathname === '/') {
      navigate(getPath(firstItem?.title ?? ''));
    }
  }, [firstItem?.title, isLoading, location.pathname, navigate]);

  if (error) {
    if (error instanceof LogtoClientError) {
      return <SessionExpired />;
    }

    return <AppError errorMessage={error.message} callStack={error.stack} />;
  }

  if (!isAuthenticated || isLoading) {
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
