import { conditional } from '@silverhand/essentials';
import { useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import AppLoading from '@/components/AppLoading';
import { isCloud } from '@/consts/env';
import useConfigs from '@/hooks/use-configs';
import useScroll from '@/hooks/use-scroll';
import useUserPreferences from '@/hooks/use-user-preferences';
import Broadcast from '@/onboarding/components/Broadcast';

import { getPath } from '../ConsoleContent/Sidebar';
import { useSidebarMenuItems } from '../ConsoleContent/Sidebar/hook';

import Topbar from './components/Topbar';
import * as styles from './index.module.scss';
import { type AppContentOutletContext } from './types';

function AppContent() {
  const { isLoading: isPreferencesLoading } = useUserPreferences();
  const { isLoading: isConfigsLoading } = useConfigs();

  const isLoading = isPreferencesLoading || isConfigsLoading;

  const location = useLocation();
  const navigate = useNavigate();
  const { firstItem } = useSidebarMenuItems();
  const scrollableContent = useRef<HTMLDivElement>(null);
  const { scrollTop } = useScroll(scrollableContent.current);

  useEffect(() => {
    // Navigate to the first menu item after configs are loaded.
    if (!isLoading && location.pathname === '/') {
      navigate(getPath(firstItem?.title ?? ''), { replace: true });
    }
  }, [firstItem?.title, isLoading, location.pathname, navigate]);

  if (isLoading) {
    return <AppLoading />;
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
