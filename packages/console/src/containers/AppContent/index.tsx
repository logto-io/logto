import { LogtoClientError, LogtoError, useLogto } from '@logto/react';
import { conditional } from '@silverhand/essentials';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import AppError from '@/components/AppError';
import AppLoading from '@/components/AppLoading';
import SessionExpired from '@/components/SessionExpired';
import { isCloud } from '@/consts/env';
import useConfigs from '@/hooks/use-configs';
import useScroll from '@/hooks/use-scroll';
import useUserPreferences from '@/hooks/use-user-preferences';
import useValidateTenantAccess from '@/hooks/use-validate-tenant-access';
import Broadcast from '@/onboarding/components/Broadcast';

import { getPath } from '../ConsoleContent/Sidebar';
import { useSidebarMenuItems } from '../ConsoleContent/Sidebar/hook';

import Topbar from './components/Topbar';
import * as styles from './index.module.scss';
import { type AppContentOutletContext } from './types';

function AppContent() {
  const { error } = useLogto();
  const { isLoading: isPreferencesLoading } = useUserPreferences();
  const { isLoading: isConfigsLoading } = useConfigs();

  const isLoading = isPreferencesLoading || isConfigsLoading;

  const location = useLocation();
  const navigate = useNavigate();
  const { firstItem } = useSidebarMenuItems();
  const scrollableContent = useRef<HTMLDivElement>(null);
  const { scrollTop } = useScroll(scrollableContent.current);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  useValidateTenantAccess();

  useEffect(() => {
    // Navigate to the first menu item after configs are loaded.
    if (!isLoading && location.pathname === '/') {
      navigate(getPath(firstItem?.title ?? ''), { replace: true });
    }
  }, [firstItem?.title, isLoading, location.pathname, navigate]);

  if (isLoading) {
    return <AppLoading />;
  }

  if (error) {
    if (error instanceof LogtoClientError) {
      return <SessionExpired error={error} />;
    }

    if (error instanceof LogtoError && error.code === 'crypto_subtle_unavailable') {
      return <AppError errorMessage={t('errors.insecure_contexts')} callStack={error.stack} />;
    }

    return <AppError errorMessage={error.message} callStack={error.stack} />;
  }

  return (
    <>
      <div className={styles.app}>
        <Topbar className={conditional(scrollTop && styles.topbarShadow)} />
        <Outlet context={{ scrollableContent } satisfies AppContentOutletContext} />
      </div>
      {isCloud && <Broadcast />}
    </>
  );
}

export default AppContent;
