import { LogtoClientError, LogtoError, useLogto } from '@logto/react';
import { conditional } from '@silverhand/essentials';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useHref, useLocation, useNavigate } from 'react-router-dom';

import AppError from '@/components/AppError';
import AppLoading from '@/components/AppLoading';
import SessionExpired from '@/components/SessionExpired';
import useScroll from '@/hooks/use-scroll';
import useSettings from '@/hooks/use-settings';
import useUserPreferences from '@/hooks/use-user-preferences';

import Sidebar, { getPath } from './components/Sidebar';
import { useSidebarMenuItems } from './components/Sidebar/hook';
import Topbar from './components/Topbar';
import * as styles from './index.module.scss';

const AppContent = () => {
  const { isAuthenticated, isLoading: isLogtoLoading, error, signIn } = useLogto();
  const href = useHref('/callback');
  const { isLoading: isPreferencesLoading } = useUserPreferences();
  const { isLoading: isSettingsLoading } = useSettings();
  const isLoading = isLogtoLoading || isPreferencesLoading || isSettingsLoading;

  const location = useLocation();
  const navigate = useNavigate();
  const { firstItem } = useSidebarMenuItems();
  const mainRef = useRef<HTMLDivElement>(null);
  const { scrollTop } = useScroll(mainRef.current);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  useEffect(() => {
    if (!isAuthenticated && !isLogtoLoading) {
      void signIn(new URL(href, window.location.origin).toString());
    }
  }, [href, isAuthenticated, isLogtoLoading, signIn]);

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

    if (error instanceof LogtoError && error.code === 'crypto_subtle_unavailable') {
      return <AppError errorMessage={t('errors.insecure_contexts')} callStack={error.stack} />;
    }

    return <AppError errorMessage={error.message} callStack={error.stack} />;
  }

  if (!isAuthenticated || isLoading) {
    return <AppLoading />;
  }

  return (
    <div className={styles.app}>
      <Topbar className={conditional(scrollTop && styles.topbarShadow)} />
      <div className={styles.content}>
        <Sidebar />
        <div ref={mainRef} className={styles.main}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AppContent;
