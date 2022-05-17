import { useLogto } from '@logto/react';
import { AppearanceMode } from '@logto/schemas';
import React, { useEffect } from 'react';
import { Outlet, useHref, useLocation, useNavigate } from 'react-router-dom';

import { themeStorageKey } from '@/consts';
import useAdminConsoleConfigs from '@/hooks/use-configs';
import initI18n from '@/i18n/init';

import LogtoLoading from '../LogtoLoading';
import SessionExpired from '../SessionExpired';
import Sidebar, { getPath } from './components/Sidebar';
import { useSidebarMenuItems } from './components/Sidebar/hook';
import Topbar from './components/Topbar';
import * as styles from './index.module.scss';

const defaultTheme = localStorage.getItem(themeStorageKey) ?? AppearanceMode.SyncWithSystem;

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
    const theme = configs?.appearanceMode ?? defaultTheme;
    const isFollowSystem = theme === AppearanceMode.SyncWithSystem;
    const className = styles[theme] ?? '';

    if (!isFollowSystem) {
      document.body.classList.add(className);
    }

    return () => {
      if (!isFollowSystem) {
        document.body.classList.remove(className);
      }
    };
  }, [configs?.appearanceMode]);

  useEffect(() => {
    (async () => {
      void initI18n(configs?.language);
    })();
  }, [configs?.language]);

  useEffect(() => {
    // Navigate to the first menu item after configs are loaded.
    if (configs && location.pathname === '/') {
      navigate(getPath(sections[0]?.items[0]?.title ?? ''));
    }
  }, [location.pathname, configs, sections, navigate]);

  if (!isAuthenticated || isLoadingConfigs) {
    return <LogtoLoading message="general.loading" />;
  }

  if (error) {
    return <SessionExpired />;
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
