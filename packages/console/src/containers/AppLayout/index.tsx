import { LogtoClientError, LogtoError, useLogto } from '@logto/react';
import { conditional } from '@silverhand/essentials';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useHref, useLocation, useNavigate } from 'react-router-dom';

import AppError from '@/components/AppError';
import AppLoading from '@/components/AppLoading';
import SessionExpired from '@/components/SessionExpired';
import useConfigs from '@/hooks/use-configs';
import useScroll from '@/hooks/use-scroll';
import useUserPreferences from '@/hooks/use-user-preferences';

import { getPath } from '../AppContent/Sidebar';
import { useSidebarMenuItems } from '../AppContent/Sidebar/hook';
import Topbar from './components/Topbar';
import * as styles from './index.module.scss';
import { AppLayoutOutletContext } from './types';

const AppLayout = () => {
  const { isAuthenticated, isLoading: isLogtoLoading, error, signIn } = useLogto();
  const href = useHref('/callback');
  const { isLoading: isPreferencesLoading } = useUserPreferences();
  const { isLoading: isConfigsLoading } = useConfigs();
  const isLoading = isPreferencesLoading || isConfigsLoading;

  const location = useLocation();
  const navigate = useNavigate();
  const { firstItem } = useSidebarMenuItems();
  const scrollableContent = useRef<HTMLDivElement>(null);
  const { scrollTop } = useScroll(scrollableContent.current);
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
      <Outlet context={{ scrollableContent } satisfies AppLayoutOutletContext} />
    </div>
  );
};

export default AppLayout;
